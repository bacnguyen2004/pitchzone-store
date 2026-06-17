from django.conf import settings
from django.db import models

from catalog.models import Product, ProductVariant


class Voucher(models.Model):
    DISCOUNT_PERCENT = "percent"
    DISCOUNT_FIXED = "fixed"
    DISCOUNT_CHOICES = [
        (DISCOUNT_PERCENT, "Percent"),
        (DISCOUNT_FIXED, "Fixed amount"),
    ]

    code = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_CHOICES,
        default=DISCOUNT_PERCENT,
    )
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    min_order_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )
    max_discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("code",)

    def __str__(self):
        return self.code


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipping", "Shipping"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    PAYMENT_COD = "cod"
    PAYMENT_TRANSFER = "transfer"
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_COD, "Thanh toán khi nhận hàng"),
        (PAYMENT_TRANSFER, "Chuyển khoản ngân hàng"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_COD,
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    voucher_code = models.CharField(max_length=40, blank=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items"
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
        null=True,
        blank=True,
    )
    product_name = models.CharField(max_length=200)
    variant_name = models.CharField(max_length=100, blank=True)
    compare_at_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        variant = f" ({self.variant_name})" if self.variant_name else ""
        return f"{self.quantity} x {self.product_name}{variant}"
