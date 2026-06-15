from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "price", "quantity", "total_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "full_name", "phone", "status", "total_price", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__username", "full_name", "phone", "address")
    readonly_fields = ("user", "total_price", "created_at")
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "product_name", "price", "quantity", "total_price")
    search_fields = ("order__user__username", "product_name")