from django.contrib import admin
from .models import Category, Brand, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "brand",
        "price",
        "stock",
        "is_active",
        "created_at",
    )
    list_filter = ("category", "brand", "is_active", "created_at")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("price", "stock", "is_active")


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "is_main", "created_at")
    list_filter = ("is_main", "created_at")
    search_fields = ("product__name", "alt_text")