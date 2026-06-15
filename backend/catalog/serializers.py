from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_main")


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "price",
            "stock",
            "is_active",
            "category",
            "brand",
            "images",
            "created_at",
            "updated_at",
        )