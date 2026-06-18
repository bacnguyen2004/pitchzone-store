from datetime import timedelta
from urllib.parse import quote

from django.db import transaction
from django.db.models import F
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from catalog.models import ProductVariant
from carts.models import Cart, CartItem

from .models import Order, Voucher
from .serializers import OrderSerializer
from .services.email import send_order_confirmation
from .services.vnpay import (
    build_txn_ref,
    create_payment_url,
    is_configured,
    validate_callback_amount,
    verify_callback,
    verify_signature,
)


def get_client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "127.0.0.1")


def clear_paid_items_from_cart(order: Order) -> None:
    cart = Cart.objects.filter(user=order.user).first()
    if not cart:
        return

    for item in order.items.select_related("variant"):
        cart_item = CartItem.objects.filter(
            cart=cart,
            variant=item.variant,
        ).first()

        if not cart_item:
            continue

        if cart_item.quantity <= item.quantity:
            cart_item.delete()
        else:
            cart_item.quantity -= item.quantity
            cart_item.save(update_fields=["quantity", "updated_at"])


def mark_vnpay_paid(order: Order) -> Order:
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)
        if order.payment_status == Order.PAYMENT_PAID:
            return order

        order.payment_status = Order.PAYMENT_PAID
        order.paid_at = timezone.now()
        if order.status == "pending":
            order.status = "processing"
        order.save(update_fields=["payment_status", "paid_at", "status"])
        clear_paid_items_from_cart(order)
        send_order_confirmation(order)
    return order


def release_unpaid_vnpay_orders(
    *,
    user=None,
    exclude_order_id: int | None = None,
    older_than_minutes: int | None = None,
) -> int:
    """Hủy đơn VNPay chưa thanh toán và trả lại tồn kho."""
    queryset = Order.objects.filter(
        payment_method=Order.PAYMENT_VNPAY,
        payment_status=Order.PAYMENT_UNPAID,
        status="pending",
    )
    if user is not None:
        queryset = queryset.filter(user=user)
    if exclude_order_id is not None:
        queryset = queryset.exclude(pk=exclude_order_id)
    if older_than_minutes is not None:
        cutoff = timezone.now() - timedelta(minutes=older_than_minutes)
        queryset = queryset.filter(created_at__lt=cutoff)

    released = 0
    for order in queryset.order_by("id"):
        mark_vnpay_failed(order)
        released += 1
    return released


def mark_vnpay_failed(order: Order) -> Order:
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)

        if order.payment_status == Order.PAYMENT_PAID:
            return order

        update_fields = []

        if order.payment_status != Order.PAYMENT_FAILED:
            order.payment_status = Order.PAYMENT_FAILED
            update_fields.append("payment_status")

        if order.status != "cancelled":
            for item in order.items.select_related("variant"):
                if item.variant_id:
                    ProductVariant.objects.filter(pk=item.variant_id).update(
                        stock=F("stock") + item.quantity
                    )

            if order.voucher_code:
                Voucher.objects.filter(
                    code=order.voucher_code,
                    used_count__gt=0,
                ).update(used_count=F("used_count") - 1)

            order.status = "cancelled"
            update_fields.append("status")

        if update_fields:
            order.save(update_fields=update_fields)

    return order


def process_vnpay_callback(order: Order, params: dict) -> tuple[bool, str]:
    ok, message = verify_callback(order, params)
    if ok:
        mark_vnpay_paid(order)
        return True, message

    signature_ok, _ = verify_signature(params)
    if signature_ok:
        amount_ok, _ = validate_callback_amount(order, params)
        if amount_ok:
            mark_vnpay_failed(order)

    return False, message


class VNPayReturnView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        params = {key: value for key, value in request.query_params.items()}
        txn_ref = params.get("vnp_TxnRef", "")
        frontend = settings.FRONTEND_URL.rstrip("/")
        status_flag = "failed"
        message = "Không tìm thấy đơn hàng."
        order_id = ""

        if txn_ref:
            order = Order.objects.filter(vnpay_txn_ref=txn_ref).first()
            if order:
                ok, message = process_vnpay_callback(order, params)
                status_flag = "success" if ok else "failed"
                if ok:
                    order_id = str(order.id)

        query = (
            f"status={status_flag}"
            f"&txn_ref={quote(txn_ref, safe='')}"
            f"&message={quote(message, safe='')}"
        )
        if order_id:
            query += f"&order_id={order_id}"
        return HttpResponseRedirect(f"{frontend}/payment/vnpay/return?{query}")


@method_decorator(csrf_exempt, name="dispatch")
class VNPayIPNView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return self._handle(request.query_params.dict())

    def post(self, request):
        data = request.data.dict() if hasattr(request.data, "dict") else dict(request.data)
        return self._handle(data)

    def _handle(self, params):
        txn_ref = params.get("vnp_TxnRef")
        if not txn_ref:
            return Response({"RspCode": "01", "Message": "Missing txn ref"})

        try:
            order = Order.objects.get(vnpay_txn_ref=txn_ref)
        except Order.DoesNotExist:
            return Response({"RspCode": "01", "Message": "Order not found"})

        signature_ok, message = verify_signature(params)
        if not signature_ok:
            return Response({"RspCode": "97", "Message": "Invalid signature"})

        amount_ok, amount_message = validate_callback_amount(order, params)
        if not amount_ok:
            return Response({"RspCode": "04", "Message": amount_message})

        ok, callback_message = verify_callback(order, params)
        if ok:
            mark_vnpay_paid(order)
            return Response({"RspCode": "00", "Message": "Confirm Success"})

        mark_vnpay_failed(order)
        return Response({"RspCode": "04", "Message": callback_message})


class VNPayVerifyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        params = {key: value for key, value in request.query_params.items()}
        txn_ref = params.get("vnp_TxnRef") or params.get("txn_ref")
        order = Order.objects.filter(vnpay_txn_ref=txn_ref).first() if txn_ref else None

        if params.get("vnp_SecureHash") and order:
            ok, message = verify_callback(order, params)
        elif order:
            ok = order.payment_status == Order.PAYMENT_PAID
            message = "success" if ok else order.payment_status
        else:
            ok = False
            message = "Không tìm thấy đơn hàng."

        return Response(
            {
                "success": ok,
                "message": message,
                "order": (
                    OrderSerializer(order).data
                    if order and order.payment_status == Order.PAYMENT_PAID
                    else None
                ),
            }
        )


def build_vnpay_payment(order, request) -> str | None:
    if not is_configured():
        return None

    txn_ref = build_txn_ref(order.id)
    order.vnpay_txn_ref = txn_ref
    order.save(update_fields=["vnpay_txn_ref"])

    return create_payment_url(
        order=order,
        txn_ref=txn_ref,
        client_ip=get_client_ip(request),
    )