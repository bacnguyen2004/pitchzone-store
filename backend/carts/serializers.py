from rest_framework import serializers

from catalog.models import Product, ProductVariant
from catalog.serializers import ProductSerializer, ProductVariantSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(source="variant.product", read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True, product__is_active=True),
        source="variant",
        write_only=True,
        required=False,
    )
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        write_only=True,
        required=False,
    )
    unit_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )
    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_id",
            "variant",
            "variant_id",
            "quantity",
            "unit_price",
            "total_price",
        )

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

    def validate(self, attrs):
        product = attrs.pop("product_id", None)
        variant = attrs.get("variant") or getattr(self.instance, "variant", None)

        if product and not variant:
            variant = product.variants.filter(
                is_active=True,
                stock__gt=0,
            ).order_by("price", "id").first()
            if not variant:
                raise serializers.ValidationError(
                    "This product does not have an available variant."
                )
            attrs["variant"] = variant

        if self.instance is None and not variant:
            raise serializers.ValidationError(
                {"variant_id": "This field is required."}
            )

        quantity = attrs.get("quantity") or getattr(self.instance, "quantity", 1)

        if variant and quantity > variant.stock:
            raise serializers.ValidationError(
                f"Not enough stock for {variant.product.name} ({variant.name})."
            )

        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = (
            "id",
            "items",
            "total_items",
            "total_price",
            "created_at",
            "updated_at",
        )
