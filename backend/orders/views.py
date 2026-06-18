from datetime import datetime, time, timedelta

from django.db import transaction
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, F, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from config.pagination import AdminResultsSetPagination
from rest_framework import filters, permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Brand, Category, Product, ProductVariant, Promotion
from catalog.serializers import ProductSerializer
from carts.models import Cart
from catalog.services.pricing import get_variant_pricing
from .serializers import (
    AdminVoucherSerializer,
    CheckoutSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    PublicVoucherSerializer,
    ShippingQuoteSerializer,
    VoucherValidateSerializer,
    VoucherWriteSerializer,
)
from .models import Order, OrderItem, Voucher


def build_daily_trend(queryset, days=30):
    now = timezone.now()
    start = timezone.localdate(now) - timedelta(days=days - 1)
    start_dt = timezone.make_aware(datetime.combine(start, time.min))

    rows = (
        queryset.filter(created_at__gte=start_dt)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(
            revenue=Sum("total_price"),
            orders=Count("id"),
        )
        .order_by("day")
    )
    by_day = {
        row["day"]: {
            "revenue": row["revenue"] or 0,
            "orders": row["orders"] or 0,
        }
        for row in rows
    }

    trend = []
    for offset in range(days):
        day = start + timedelta(days=offset)
        stats = by_day.get(day, {"revenue": 0, "orders": 0})
        trend.append(
            {
                "date": day.isoformat(),
                "label": day.strftime("%d/%m"),
                "revenue": stats["revenue"],
                "orders": stats["orders"],
            }
        )

    return trend
from .permissions import IsAdminUser
from .payment_views import build_vnpay_payment, release_unpaid_vnpay_orders
from .services.email import send_order_confirmation
from .services.fulfillment import maybe_create_shipment
from .services.shipping_provider import estimate_weight_grams, get_shipping_quote
from .services.vnpay import is_configured as vnpay_configured
from .services.vouchers import (
    compute_voucher_discount,
    get_voucher_by_code,
    validate_voucher,
)


def restore_order_stock(order):
    for item in order.items.select_related("variant"):
        if item.variant_id:
            ProductVariant.objects.filter(pk=item.variant_id).update(
                stock=F("stock") + item.quantity
            )


def exclude_unconfirmed_vnpay_orders(queryset):
    return queryset.exclude(
        payment_method=Order.PAYMENT_VNPAY,
        payment_status__in=[Order.PAYMENT_UNPAID, Order.PAYMENT_FAILED],
    )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        orders = Order.objects.filter(user=self.request.user)
        return exclude_unconfirmed_vnpay_orders(orders).prefetch_related(
            "items",
            "items__product",
            "items__product__images",
            "items__variant",
        ).order_by("-created_at")

    @action(detail=False, methods=["get"], url_path="shipping-quote")
    def shipping_quote(self, request):
        serializer = ShippingQuoteSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        quote = get_shipping_quote(
            subtotal=serializer.validated_data["subtotal"],
            city=serializer.validated_data.get("city", ""),
            district_id=serializer.validated_data.get("district_id"),
            ward_code=serializer.validated_data.get("ward_code", ""),
            weight_grams=serializer.validated_data.get("weight_grams"),
            item_count=serializer.validated_data.get("item_count", 1),
        )
        return Response(quote)

    @action(detail=False, methods=["post"], url_path="checkout")
    def checkout(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = Cart.objects.filter(user=request.user).prefetch_related(
            "items",
            "items__variant",
            "items__variant__product",
        ).first()

        if not cart or not cart.items.exists():
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = serializer.validated_data.get(
            "payment_method",
            Order.PAYMENT_COD,
        )
        if payment_method == Order.PAYMENT_VNPAY:
            release_unpaid_vnpay_orders(user=request.user)

        with transaction.atomic():
            cart_items = list(
                cart.items.select_related("variant", "variant__product")
            )
            variant_ids = [item.variant_id for item in cart_items]
            locked_variants = {
                variant.id: variant
                for variant in ProductVariant.objects.select_for_update().filter(
                    id__in=variant_ids
                )
            }

            for item in cart_items:
                variant = locked_variants.get(item.variant_id)
                if not variant or item.quantity > variant.stock:
                    available = variant.stock if variant else 0
                    name = variant.product.name if variant else "sản phẩm"
                    variant_label = variant.name if variant else ""
                    return Response(
                        {
                            "detail": (
                                f"Not enough stock for {name} "
                                f"({variant_label}). Available: {available}."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            subtotal = sum(item.total_price for item in cart_items)
            city = serializer.validated_data.get("city", "")
            item_count = sum(item.quantity for item in cart_items)
            shipping_weight = estimate_weight_grams(item_count)
            quote = get_shipping_quote(
                subtotal=subtotal,
                city=city,
                district_id=serializer.validated_data.get("district_id"),
                ward_code=serializer.validated_data.get("ward_code", ""),
                weight_grams=shipping_weight,
                item_count=item_count,
            )
            shipping_fee = quote["shipping_fee"]
            voucher_code = serializer.validated_data.get("voucher_code", "")
            discount_amount = 0
            voucher = None

            if voucher_code:
                voucher = get_voucher_by_code(voucher_code)
                try:
                    validate_voucher(voucher, subtotal)
                except serializers.ValidationError as exc:
                    return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
                discount_amount = compute_voucher_discount(subtotal, voucher)

            total_price = subtotal + shipping_fee - discount_amount

            if payment_method == Order.PAYMENT_VNPAY and not vnpay_configured():
                return Response(
                    {"detail": "VNPay chưa được cấu hình."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            if payment_method == Order.PAYMENT_VNPAY:
                payment_status = Order.PAYMENT_UNPAID
            else:
                payment_status = Order.PAYMENT_PENDING

            order = Order.objects.create(
                user=request.user,
                full_name=serializer.validated_data["full_name"],
                phone=serializer.validated_data["phone"],
                address=serializer.validated_data["address"],
                city=city,
                note=serializer.validated_data.get("note", ""),
                payment_method=payment_method,
                payment_status=payment_status,
                district_id=quote.get("district_id"),
                ward_code=serializer.validated_data.get("ward_code", ""),
                shipping_weight=shipping_weight,
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                discount_amount=discount_amount,
                voucher_code=voucher.code if voucher else "",
                total_price=total_price,
            )

            order_items = []
            for item in cart_items:
                variant = locked_variants[item.variant_id]
                product = variant.product
                item_total = item.total_price
                pricing = get_variant_pricing(variant)

                order_items.append(
                    OrderItem(
                        order=order,
                        product=product,
                        variant=variant,
                        product_name=product.name,
                        variant_name=variant.name,
                        compare_at_price=(
                            pricing["compare_at_price"]
                            if pricing["is_on_sale"]
                            else None
                        ),
                        price=pricing["effective_price"],
                        quantity=item.quantity,
                        total_price=item_total,
                    )
                )

                variant.stock -= item.quantity
                variant.save(update_fields=["stock"])

            OrderItem.objects.bulk_create(order_items)

            if voucher:
                locked_voucher = Voucher.objects.select_for_update().get(pk=voucher.pk)
                locked_voucher.used_count += 1
                locked_voucher.save(update_fields=["used_count"])

            if payment_method != Order.PAYMENT_VNPAY:
                cart.items.all().delete()

        order = Order.objects.prefetch_related(
            "items",
            "items__product",
            "items__variant",
        ).get(pk=order.pk)
        payment_url = None
        if order.payment_method == Order.PAYMENT_VNPAY:
            payment_url = build_vnpay_payment(order, request)
        else:
            send_order_confirmation(order)

        payload = OrderSerializer(order).data
        if payment_url:
            payload["payment_url"] = payment_url

        return Response(payload, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="retry-payment")
    def retry_payment(self, request, pk=None):
        order = self.get_object()
        if order.payment_method != Order.PAYMENT_VNPAY:
            return Response(
                {"detail": "Đơn hàng không dùng VNPay."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.payment_status != Order.PAYMENT_UNPAID:
            return Response(
                {"detail": "Đơn hàng không ở trạng thái chờ thanh toán."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not vnpay_configured():
            return Response(
                {"detail": "VNPay chưa được cấu hình."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        payment_url = build_vnpay_payment(order, request)
        order = self.get_queryset().get(pk=order.pk)
        payload = OrderSerializer(order).data
        payload["payment_url"] = payment_url
        return Response(payload)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status in {"completed", "cancelled", "shipping"}:
            return Response(
                {"detail": "Đơn hàng này không thể hủy."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status == "cancelled":
                return Response(OrderSerializer(order).data)
            order.status = "cancelled"
            order.save(update_fields=["status"])
            restore_order_stock(order)

        order = self.get_queryset().get(pk=order.pk)
        return Response(OrderSerializer(order).data)

    @action(
        detail=False,
        methods=["get"],
        url_path="admin",
        permission_classes=[permissions.IsAuthenticated, IsAdminUser],
    )
    def admin_list(self, request):
        orders = exclude_unconfirmed_vnpay_orders(
            Order.objects.select_related("user")
        ).prefetch_related(
            "items",
            "items__product",
            "items__variant",
        ).order_by("-created_at")

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            orders = orders.filter(status=status_param)

        search = request.query_params.get("search", "").strip()
        if search:
            search_filter = (
                Q(full_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(address__icontains=search)
                | Q(voucher_code__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
            )
            if search.isdigit():
                search_filter |= Q(id=int(search))
            orders = orders.filter(search_filter)

        paginator = AdminResultsSetPagination()
        page = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        url_path="status",
        permission_classes=[permissions.IsAuthenticated, IsAdminUser],
    )
    def update_status(self, request, pk=None):
        order = Order.objects.get(pk=pk)
        previous_status = order.status
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        next_status = serializer.validated_data["status"]

        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=pk)
            if (
                next_status == "cancelled"
                and previous_status != "cancelled"
                and order.status != "cancelled"
            ):
                restore_order_stock(order)
            order.status = next_status
            order.save(update_fields=["status"])

            if next_status == "processing":
                maybe_create_shipment(order)

        order = Order.objects.prefetch_related("items").get(pk=pk)
        return Response(OrderSerializer(order).data)


class AdminVoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all().order_by("code")
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "description"]
    ordering_fields = ["code", "starts_at", "ends_at", "used_count"]
    ordering = ["code"]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return VoucherWriteSerializer

        return AdminVoucherSerializer


class ActiveVouchersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        vouchers = (
            Voucher.objects.filter(
                is_active=True,
                starts_at__lte=now,
                ends_at__gte=now,
            )
            .filter(
                Q(usage_limit__isnull=True)
                | Q(used_count__lt=F("usage_limit"))
            )
            .order_by("code")
        )
        serializer = PublicVoucherSerializer(vouchers, many=True)
        return Response(serializer.data)


class VoucherValidateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VoucherValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        voucher = serializer.validated_data["voucher"]

        return Response(
            {
                "code": voucher.code,
                "description": voucher.description,
                "discount_amount": serializer.validated_data["discount_amount"],
                "subtotal": serializer.validated_data["subtotal"],
                "total_price": (
                    serializer.validated_data["subtotal"]
                    - serializer.validated_data["discount_amount"]
                ),
            }
        )


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        User = get_user_model()
        orders = exclude_unconfirmed_vnpay_orders(Order.objects.all())
        valid_orders = orders.exclude(status="cancelled")
        now = timezone.now()
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)

        revenue = valid_orders.aggregate(total=Sum("total_price"))["total"] or 0
        revenue_7d = (
            valid_orders.filter(created_at__gte=last_7d).aggregate(
                total=Sum("total_price")
            )["total"]
            or 0
        )
        revenue_30d = (
            valid_orders.filter(created_at__gte=last_30d).aggregate(
                total=Sum("total_price")
            )["total"]
            or 0
        )
        orders_7d = orders.filter(created_at__gte=last_7d).count()
        orders_30d = orders.filter(created_at__gte=last_30d).count()
        avg_order_value = valid_orders.aggregate(avg=Avg("total_price"))["avg"] or 0
        total_discount = (
            valid_orders.aggregate(total=Sum("discount_amount"))["total"] or 0
        )

        status_counts = orders.values("status").annotate(count=Count("id"))
        payment_methods = (
            orders.values("payment_method")
            .annotate(
                count=Count("id"),
                revenue=Sum("total_price"),
            )
            .order_by("-count")
        )
        payment_status_counts = (
            orders.values("payment_status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        daily_trend = build_daily_trend(valid_orders, days=30)

        top_products = list(
            OrderItem.objects.filter(order__in=valid_orders)
            .values("product_name")
            .annotate(
                quantity=Sum("quantity"),
                revenue=Sum("total_price"),
            )
            .order_by("-revenue")[:6]
        )
        category_sales = list(
            OrderItem.objects.filter(
                order__in=valid_orders,
                product__category__isnull=False,
            )
            .values("product__category__name")
            .annotate(
                quantity=Sum("quantity"),
                revenue=Sum("total_price"),
            )
            .order_by("-revenue")[:6]
        )
        voucher_usage = list(
            valid_orders.exclude(voucher_code="")
            .values("voucher_code")
            .annotate(
                uses=Count("id"),
                discount=Sum("discount_amount"),
            )
            .order_by("-uses")[:5]
        )

        recent_orders = orders.select_related("user").prefetch_related(
            "items",
            "items__product",
            "items__variant",
        ).order_by("-created_at")[:8]
        low_stock_products = Product.objects.select_related(
            "category",
            "brand",
        ).prefetch_related("images", "variants").annotate(
            active_stock=Sum(
                "variants__stock",
                filter=Q(variants__is_active=True),
            )
        ).filter(
            active_stock__lte=5,
        ).order_by("active_stock", "name")[:8]
        pending_orders = orders.filter(status="pending").count()
        completed_orders = orders.filter(status="completed").count()
        active_promotions = Promotion.objects.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        ).count()
        active_vouchers = Voucher.objects.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        ).filter(
            Q(usage_limit__isnull=True) | Q(used_count__lt=F("usage_limit"))
        ).count()
        new_customers_30d = User.objects.filter(
            is_staff=False,
            date_joined__gte=last_30d,
        ).count()

        return Response(
            {
                "total_revenue": revenue,
                "revenue_7d": revenue_7d,
                "revenue_30d": revenue_30d,
                "total_orders": orders.count(),
                "orders_7d": orders_7d,
                "orders_30d": orders_30d,
                "pending_orders": pending_orders,
                "completed_orders": completed_orders,
                "avg_order_value": avg_order_value,
                "total_discount": total_discount,
                "total_products": Product.objects.filter(is_active=True).count(),
                "total_categories": Category.objects.count(),
                "total_brands": Brand.objects.count(),
                "total_customers": User.objects.filter(is_staff=False).count(),
                "new_customers_30d": new_customers_30d,
                "active_promotions": active_promotions,
                "active_vouchers": active_vouchers,
                "status_counts": list(status_counts),
                "payment_methods": list(payment_methods),
                "payment_status_counts": list(payment_status_counts),
                "daily_trend": daily_trend,
                "top_products": top_products,
                "category_sales": [
                    {
                        "name": row["product__category__name"],
                        "quantity": row["quantity"],
                        "revenue": row["revenue"],
                    }
                    for row in category_sales
                ],
                "voucher_usage": voucher_usage,
                "recent_orders": OrderSerializer(recent_orders, many=True).data,
                "low_stock_products": ProductSerializer(
                    low_stock_products,
                    many=True,
                    context={"request": request},
                ).data,
            }
        )
