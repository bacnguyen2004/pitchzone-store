from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    image = models.ImageField(upload_to="brands/", blank=True, null=True)

    def __str__(self):
        return self.name


class Promotion(models.Model):
    DISCOUNT_PERCENT = "percent"
    DISCOUNT_FIXED = "fixed"
    DISCOUNT_CHOICES = [
        (DISCOUNT_PERCENT, "Percent"),
        (DISCOUNT_FIXED, "Fixed amount"),
    ]

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True)
    eyebrow = models.CharField(max_length=80, default="Flash sale")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_CHOICES,
        default=DISCOUNT_PERCENT,
    )
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    perks = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-starts_at",)

    def __str__(self):
        return self.name


class PromotionProduct(models.Model):
    promotion = models.ForeignKey(
        Promotion,
        on_delete=models.CASCADE,
        related_name="promotion_products",
    )
    product = models.ForeignKey(
        "Product",
        on_delete=models.CASCADE,
        related_name="promotion_links",
    )
    discount_percent = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Override promotion discount for this product.",
    )

    class Meta:
        unique_together = ("promotion", "product")

    def __str__(self):
        return f"{self.promotion.name} — {self.product.name}"


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def price(self):
        from catalog.services.pricing import get_product_pricing

        return get_product_pricing(self)["effective_price"]

    @property
    def stock(self):
        total = self.variants.filter(is_active=True).aggregate(
            total=models.Sum("stock")
        )["total"]
        return total or 0

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )
    sku = models.CharField(max_length=80, unique=True)
    size = models.CharField(max_length=30)
    color = models.CharField(max_length=50, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    sale_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("product__name", "size", "color")
        unique_together = ("product", "size", "color")

    @property
    def name(self):
        parts = [self.size]
        if self.color:
            parts.append(self.color)
        return " / ".join(parts)

    @property
    def effective_price(self):
        from catalog.services.pricing import get_variant_pricing

        return get_variant_pricing(self)["effective_price"]

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="product_reviews",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    title = models.CharField(max_length=120, blank=True)
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        unique_together = ("product", "user")

    def __str__(self):
        return f"{self.product.name} — {self.rating}★ by {self.user.username}"
