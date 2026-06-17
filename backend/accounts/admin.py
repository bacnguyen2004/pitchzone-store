from django.contrib import admin

from .models import Address, CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "full_name", "phone", "updated_at")
    list_filter = ("created_at", "updated_at")
    search_fields = ("user__username", "user__email", "full_name", "phone")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "full_name",
        "phone",
        "street_address",
        "city",
        "ward",
        "is_default",
        "updated_at",
    )
    list_filter = ("city", "is_default", "created_at", "updated_at")
    search_fields = (
        "user__username",
        "full_name",
        "phone",
        "street_address",
        "city",
        "ward",
    )
    list_editable = ("is_default",)
    readonly_fields = ("created_at", "updated_at")
