from django.contrib import admin

from .models import Order, OrderItem, Voucher


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "variant",
        "product_name",
        "variant_name",
        "compare_at_price",
        "price",
        "quantity",
        "total_price",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "phone",
        "status",
        "subtotal",
        "discount_amount",
        "voucher_code",
        "total_price",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("user__username", "full_name", "phone", "address", "voucher_code")
    readonly_fields = (
        "user",
        "subtotal",
        "discount_amount",
        "voucher_code",
        "total_price",
        "created_at",
    )
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product_name",
        "variant_name",
        "compare_at_price",
        "price",
        "quantity",
        "total_price",
    )
    search_fields = ("order__user__username", "product_name", "variant_name")


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "discount_value",
        "min_order_amount",
        "starts_at",
        "ends_at",
        "is_active",
        "used_count",
        "usage_limit",
    )
    list_filter = ("is_active", "discount_type")
    search_fields = ("code", "description")