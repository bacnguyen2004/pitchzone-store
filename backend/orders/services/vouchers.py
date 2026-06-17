from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework import serializers

from orders.models import Voucher


def round_price(value):
    return Decimal(value).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def get_voucher_by_code(code):
    if not code:
        return None

    return Voucher.objects.filter(code__iexact=code.strip()).first()


def validate_voucher(voucher, subtotal, at=None):
    at = at or timezone.now()
    subtotal = Decimal(subtotal)

    if voucher is None:
        raise serializers.ValidationError({"voucher_code": "Mã voucher không hợp lệ."})

    if not voucher.is_active:
        raise serializers.ValidationError({"voucher_code": "Mã voucher không còn hiệu lực."})

    if not (voucher.starts_at <= at <= voucher.ends_at):
        raise serializers.ValidationError({"voucher_code": "Mã voucher đã hết hạn."})

    if voucher.usage_limit is not None and voucher.used_count >= voucher.usage_limit:
        raise serializers.ValidationError({"voucher_code": "Mã voucher đã hết lượt sử dụng."})

    if subtotal < Decimal(voucher.min_order_amount):
        min_amount = f"{int(voucher.min_order_amount):,}".replace(",", ".")
        raise serializers.ValidationError(
            {
                "voucher_code": f"Đơn tối thiểu {min_amount}đ để dùng mã này.",
            }
        )

    return voucher


def compute_voucher_discount(subtotal, voucher):
    subtotal = Decimal(subtotal)

    if voucher.discount_type == Voucher.DISCOUNT_FIXED:
        return min(round_price(voucher.discount_value), subtotal)

    percent = Decimal(voucher.discount_value)
    discount = round_price(subtotal * percent / Decimal("100"))

    if voucher.max_discount_amount is not None:
        discount = min(discount, Decimal(voucher.max_discount_amount))

    return min(discount, subtotal)