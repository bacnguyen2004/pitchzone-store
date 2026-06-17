from django.contrib.auth import get_user_model
from rest_framework import serializers

from catalog.serializers import ProductVariantSerializer

User = get_user_model()
from orders.services.vouchers import (
    compute_voucher_discount,
    get_voucher_by_code,
    validate_voucher,
)
from .models import Order, OrderItem, Voucher


class PublicVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = (
            "code",
            "description",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "max_discount_amount",
            "ends_at",
        )


class VoucherWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = (
            "id",
            "code",
            "description",
            "discount_type",
            "discount_value",
            "min_order_amount",
            "max_discount_amount",
            "starts_at",
            "ends_at",
            "is_active",
            "usage_limit",
        )
        read_only_fields = ("id",)

    def validate_code(self, value):
        return value.strip().upper()

    def validate(self, attrs):
        starts_at = attrs.get("starts_at") or getattr(self.instance, "starts_at", None)
        ends_at = attrs.get("ends_at") or getattr(self.instance, "ends_at", None)

        if starts_at and ends_at and starts_at >= ends_at:
            raise serializers.ValidationError(
                {"ends_at": "End time must be after start time."}
            )

        return attrs


class AdminVoucherSerializer(VoucherWriteSerializer):
    class Meta(VoucherWriteSerializer.Meta):
        fields = VoucherWriteSerializer.Meta.fields + (
            "used_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "used_count", "created_at", "updated_at")


class OrderItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "variant",
            "product_name",
            "variant_name",
            "compare_at_price",
            "price",
            "quantity",
            "total_price",
        )


class OrderUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = OrderUserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "full_name",
            "phone",
            "address",
            "city",
            "note",
            "payment_method",
            "status",
            "subtotal",
            "shipping_fee",
            "discount_amount",
            "voucher_code",
            "total_price",
            "items",
            "created_at",
        )
        read_only_fields = (
            "status",
            "subtotal",
            "discount_amount",
            "total_price",
            "created_at",
        )


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    note = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_METHOD_CHOICES,
        default=Order.PAYMENT_COD,
    )
    voucher_code = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=40,
    )

    def validate_voucher_code(self, value):
        return value.strip().upper()


class ShippingQuoteSerializer(serializers.Serializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    city = serializers.CharField(required=False, allow_blank=True, max_length=100)


class VoucherValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=40)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)

    def validate_code(self, value):
        return value.strip().upper()

    def validate(self, attrs):
        voucher = get_voucher_by_code(attrs["code"])
        validate_voucher(voucher, attrs["subtotal"])
        attrs["voucher"] = voucher
        attrs["discount_amount"] = compute_voucher_discount(
            attrs["subtotal"],
            voucher,
        )
        return attrs


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)