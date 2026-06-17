from django.contrib import admin

from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Promotion,
    PromotionProduct,
)


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


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = (
        "sku",
        "size",
        "color",
        "price",
        "compare_at_price",
        "sale_price",
        "stock",
        "is_active",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "brand",
        "base_price",
        "total_stock",
        "is_active",
        "created_at",
    )
    list_filter = ("category", "brand", "is_active", "created_at")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("base_price", "is_active")
    inlines = [ProductVariantInline]

    def total_stock(self, obj):
        return obj.stock


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "sku",
        "size",
        "color",
        "price",
        "sale_price",
        "stock",
        "is_active",
    )
    list_filter = ("is_active", "size", "color", "product__category", "product__brand")
    search_fields = ("sku", "product__name", "size", "color")
    list_editable = ("price", "sale_price", "stock", "is_active")


class PromotionProductInline(admin.TabularInline):
    model = PromotionProduct
    extra = 1
    autocomplete_fields = ("product",)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "discount_type",
        "discount_value",
        "starts_at",
        "ends_at",
        "is_active",
    )
    list_filter = ("is_active", "discount_type", "starts_at")
    search_fields = ("name", "slug", "title")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [PromotionProductInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "is_main", "created_at")
    list_filter = ("is_main", "created_at")
    search_fields = ("product__name", "alt_text")