from rest_framework import serializers

from catalog.serializers import ProductSerializer
from catalog.models import Product
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True
    )
    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_id",
            "quantity",
            "total_price",
        )

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

    def validate(self, attrs):
        product = attrs.get("product") or getattr(self.instance, "product", None)
        quantity = attrs.get("quantity") or getattr(self.instance, "quantity", 1)

        if product and quantity > product.stock:
            raise serializers.ValidationError("Not enough product stock.")

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