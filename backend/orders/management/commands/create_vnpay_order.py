from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from catalog.models import ProductVariant
from catalog.services.pricing import get_variant_pricing
from orders.models import Order, OrderItem
from orders.services.shipping_provider import get_shipping_quote
from orders.services.vnpay import build_txn_ref, create_payment_url, is_configured


class Command(BaseCommand):
    help = "Tạo đơn VNPay mới với txn_ref và payment URL mới."

    def add_arguments(self, parser):
        parser.add_argument("--user-id", type=int, help="ID user (mặc định: user đầu tiên)")
        parser.add_argument("--variant-id", type=int, help="ID biến thể sản phẩm")
        parser.add_argument("--amount", type=int, help="Tổng tiền VND (bỏ qua nếu dùng variant)")

    def handle(self, *args, **options):
        if not is_configured():
            raise CommandError("VNPay chưa được cấu hình trong .env")

        User = get_user_model()
        user = (
            User.objects.filter(pk=options["user_id"]).first()
            if options.get("user_id")
            else User.objects.order_by("id").first()
        )
        if not user:
            raise CommandError("Không tìm thấy user.")

        variant = None
        if options.get("variant_id"):
            variant = (
                ProductVariant.objects.select_related("product")
                .filter(pk=options["variant_id"], stock__gt=0)
                .first()
            )
            if not variant:
                raise CommandError("Biến thể không tồn tại hoặc hết hàng.")
        elif not options.get("amount"):
            variant = (
                ProductVariant.objects.select_related("product")
                .filter(stock__gt=0, price__lt=500000)
                .order_by("price")
                .first()
            )

        with transaction.atomic():
            if variant:
                pricing = get_variant_pricing(variant)
                unit_price = pricing["effective_price"]
                subtotal = unit_price
                quote = get_shipping_quote(
                    subtotal=subtotal,
                    city="Hà Nội",
                    district_id=1484,
                    ward_code="",
                    weight_grams=500,
                    item_count=1,
                )
                shipping_fee = quote["shipping_fee"]
                total_price = subtotal + shipping_fee

                order = Order.objects.create(
                    user=user,
                    full_name=user.get_full_name() or user.username or "Test User",
                    phone="0398438276",
                    address="98 Duong Binh Tri Dong",
                    city="Hà Nội",
                    payment_method=Order.PAYMENT_VNPAY,
                    payment_status=Order.PAYMENT_UNPAID,
                    district_id=quote.get("district_id"),
                    shipping_weight=500,
                    subtotal=subtotal,
                    shipping_fee=shipping_fee,
                    total_price=total_price,
                )
                OrderItem.objects.create(
                    order=order,
                    product=variant.product,
                    variant=variant,
                    product_name=variant.product.name,
                    variant_name=variant.name or variant.size or "",
                    price=unit_price,
                    quantity=1,
                    total_price=subtotal,
                )
                variant.stock -= 1
                variant.save(update_fields=["stock"])
            else:
                total_price = Decimal(options["amount"])
                order = Order.objects.create(
                    user=user,
                    full_name=user.get_full_name() or user.username or "Test User",
                    phone="0398438276",
                    address="98 Duong Binh Tri Dong",
                    city="Hà Nội",
                    payment_method=Order.PAYMENT_VNPAY,
                    payment_status=Order.PAYMENT_UNPAID,
                    subtotal=total_price,
                    shipping_fee=Decimal("0"),
                    total_price=total_price,
                )

            txn_ref = build_txn_ref(order.id)
            order.vnpay_txn_ref = txn_ref
            order.save(update_fields=["vnpay_txn_ref"])

        payment_url = create_payment_url(
            order=order,
            txn_ref=txn_ref,
            client_ip="127.0.0.1",
        )

        self.stdout.write(self.style.SUCCESS(f"Đã tạo đơn #{order.id}"))
        self.stdout.write(f"User: {user.email or user.username}")
        self.stdout.write(f"TxnRef: {txn_ref}")
        self.stdout.write(f"Tổng tiền: {int(order.total_price):,} VND")
        self.stdout.write("")
        self.stdout.write("Mở URL thanh toán (trong 30 phút):")
        self.stdout.write(payment_url)
        self.stdout.write("")
        self.stdout.write("Thẻ test NCB: 9704198526191432198 | OTP: 123456")