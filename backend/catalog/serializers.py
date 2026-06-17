from django.utils.text import slugify as django_slugify
from rest_framework import serializers

from catalog.services.pricing import get_product_pricing, get_variant_pricing
from .models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductReview,
    ProductVariant,
    Promotion,
    PromotionProduct,
)


def build_default_sku(product, suffix="one-size"):
    suffix = suffix[:30]
    max_slug_length = 79 - len(suffix)
    base = f"{product.slug[:max_slug_length]}-{suffix}"
    sku = base
    counter = 2

    while ProductVariant.objects.filter(sku=sku).exists():
        sku = f"{product.slug[:max_slug_length]}-{suffix}-{counter}"
        counter += 1

    return sku


def get_or_create_default_variant(product):
    variant = (
        product.variants.filter(is_active=True).order_by("id").first()
        or product.variants.order_by("id").first()
    )

    if variant:
        return variant

    return ProductVariant.objects.create(
        product=product,
        sku=build_default_sku(product),
        size="One Size",
        color="",
        price=product.base_price,
        stock=0,
        is_active=product.is_active,
    )


def absolute_media_url(request, file_field):
    if not file_field:
        return None

    url = file_field.url
    if request:
        return request.build_absolute_uri(url)
    return url


def sync_main_product_image(product, image_file):
    if not image_file:
        return

    main_image = (
        product.images.filter(is_main=True).first() or product.images.first()
    )

    if main_image:
        if main_image.image:
            main_image.image.delete(save=False)
        main_image.image = image_file
        main_image.alt_text = product.name
        main_image.is_main = True
        main_image.save()
        return

    ProductImage.objects.create(
        product=product,
        image=image_file,
        alt_text=product.name,
        is_main=True,
    )


def sync_default_variant(product, *, price=None, stock=None):
    variant = get_or_create_default_variant(product)
    update_fields = []

    if price is not None:
        variant.price = price
        update_fields.append("price")

    if stock is not None:
        variant.stock = stock
        update_fields.append("stock")

    variant.is_active = product.is_active
    update_fields.append("is_active")

    if update_fields:
        variant.save(update_fields=list(dict.fromkeys(update_fields)))

    return variant


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image", "product_count")

    def get_image(self, obj):
        return absolute_media_url(self.context.get("request"), obj.image)

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class CategoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image")
        read_only_fields = ("id",)


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "image", "product_count")

    def get_image(self, obj):
        return absolute_media_url(self.context.get("request"), obj.image)

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "image")
        read_only_fields = ("id",)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_main")

    def get_image(self, obj):
        return absolute_media_url(self.context.get("request"), obj.image)


class ProductVariantSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    effective_price = serializers.SerializerMethodField()
    compare_at_price = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    is_deal = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "product_id",
            "sku",
            "name",
            "size",
            "color",
            "price",
            "compare_at_price",
            "sale_price",
            "effective_price",
            "discount_percent",
            "is_on_sale",
            "is_deal",
            "stock",
            "is_active",
        )

    def _pricing(self, obj):
        cache = self.context.setdefault("_variant_pricing_cache", {})
        if obj.id not in cache:
            cache[obj.id] = get_variant_pricing(obj)
        return cache[obj.id]

    def get_effective_price(self, obj):
        return self._pricing(obj)["effective_price"]

    def get_compare_at_price(self, obj):
        pricing = self._pricing(obj)
        if pricing["is_on_sale"]:
            return pricing["compare_at_price"]
        return None

    def get_discount_percent(self, obj):
        return self._pricing(obj)["discount_percent"]

    def get_is_on_sale(self, obj):
        return self._pricing(obj)["is_on_sale"]

    def get_is_deal(self, obj):
        return self._pricing(obj)["is_deal"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    price = serializers.SerializerMethodField()
    compare_at_price = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    is_deal = serializers.SerializerMethodField()
    stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "base_price",
            "price",
            "compare_at_price",
            "discount_percent",
            "is_on_sale",
            "is_deal",
            "stock",
            "is_active",
            "category",
            "brand",
            "images",
            "main_image",
            "variants",
            "created_at",
            "updated_at",
        )

    def _pricing(self, obj):
        cache = self.context.setdefault("_product_pricing_cache", {})
        if obj.id not in cache:
            cache[obj.id] = get_product_pricing(obj)
        return cache[obj.id]

    def get_main_image(self, obj):
        image = obj.images.filter(is_main=True).first() or obj.images.first()
        if not image:
            return None
        return absolute_media_url(self.context.get("request"), image.image)

    def get_price(self, obj):
        return self._pricing(obj)["effective_price"]

    def get_compare_at_price(self, obj):
        pricing = self._pricing(obj)
        if pricing["is_on_sale"]:
            return pricing["compare_at_price"]
        return None

    def get_discount_percent(self, obj):
        return self._pricing(obj)["discount_percent"]

    def get_is_on_sale(self, obj):
        return self._pricing(obj)["is_on_sale"]

    def get_is_deal(self, obj):
        return self._pricing(obj)["is_deal"]


class ProductWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        write_only=True,
        required=False,
    )
    stock = serializers.IntegerField(
        write_only=True,
        required=False,
        min_value=0,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source="brand",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "base_price",
            "price",
            "stock",
            "is_active",
            "category_id",
            "brand_id",
            "image",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {
            "base_price": {"required": False},
        }

    def validate(self, attrs):
        legacy_price = attrs.pop("price", None)
        if legacy_price is not None and "base_price" not in attrs:
            attrs["base_price"] = legacy_price

        if self.instance is None and "base_price" not in attrs:
            raise serializers.ValidationError(
                {"base_price": "This field is required."}
            )

        if "base_price" in attrs and attrs["base_price"] <= 0:
            raise serializers.ValidationError(
                {"base_price": "Base price must be greater than 0."}
            )

        return attrs

    def create(self, validated_data):
        image = validated_data.pop("image", None)
        stock = validated_data.pop("stock", 0)
        product = Product.objects.create(**validated_data)
        sync_default_variant(
            product,
            price=product.base_price,
            stock=stock,
        )
        sync_main_product_image(product, image)
        return product

    def update(self, instance, validated_data):
        image = validated_data.pop("image", None)
        stock = validated_data.pop("stock", None)
        product = super().update(instance, validated_data)
        sync_default_variant(
            product,
            price=product.base_price if "base_price" in validated_data else None,
            stock=stock,
        )
        sync_main_product_image(product, image)
        return product


class ProductVariantWriteSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
    )

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "product_id",
            "sku",
            "size",
            "color",
            "price",
            "compare_at_price",
            "sale_price",
            "stock",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate(self, attrs):
        sale_price = attrs.get("sale_price")
        price = attrs.get("price") or getattr(self.instance, "price", None)

        if sale_price is not None and price is not None and sale_price >= price:
            raise serializers.ValidationError(
                {"sale_price": "Sale price must be lower than list price."}
            )

        return attrs

    def create(self, validated_data):
        product = validated_data["product"]
        size = validated_data.get("size", "one-size")
        color = validated_data.get("color", "")
        suffix = size if not color else f"{size}-{color}"
        validated_data.setdefault("price", product.base_price)
        validated_data["sku"] = build_default_sku(product, django_slugify(suffix))
        return super().create(validated_data)


class PromotionProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = PromotionProduct
        fields = ("id", "product", "discount_percent")


class PromotionWriteSerializer(serializers.ModelSerializer):
    product_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Promotion
        fields = (
            "id",
            "name",
            "slug",
            "eyebrow",
            "title",
            "description",
            "discount_type",
            "discount_value",
            "starts_at",
            "ends_at",
            "is_active",
            "perks",
            "product_ids",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        starts_at = attrs.get("starts_at") or getattr(self.instance, "starts_at", None)
        ends_at = attrs.get("ends_at") or getattr(self.instance, "ends_at", None)

        if starts_at and ends_at and starts_at >= ends_at:
            raise serializers.ValidationError(
                {"ends_at": "End time must be after start time."}
            )

        if not attrs.get("slug") and attrs.get("name"):
            attrs["slug"] = django_slugify(attrs["name"])

        return attrs

    def _sync_products(self, promotion, product_ids):
        if product_ids is None:
            return

        promotion.promotion_products.all().delete()
        valid_ids = Product.objects.filter(
            id__in=product_ids,
            is_active=True,
        ).values_list("id", flat=True)

        PromotionProduct.objects.bulk_create(
            [
                PromotionProduct(promotion=promotion, product_id=product_id)
                for product_id in valid_ids
            ]
        )

    def create(self, validated_data):
        product_ids = validated_data.pop("product_ids", [])
        promotion = Promotion.objects.create(**validated_data)
        self._sync_products(promotion, product_ids)
        return promotion

    def update(self, instance, validated_data):
        product_ids = validated_data.pop("product_ids", None)
        promotion = super().update(instance, validated_data)
        self._sync_products(promotion, product_ids)
        return promotion


class PromotionSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    product_ids = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = (
            "id",
            "name",
            "slug",
            "eyebrow",
            "title",
            "description",
            "discount_type",
            "discount_value",
            "starts_at",
            "ends_at",
            "is_active",
            "perks",
            "product_count",
            "product_ids",
            "items",
        )

    def get_product_count(self, obj):
        return obj.promotion_products.count()

    def get_product_ids(self, obj):
        return list(
            obj.promotion_products.values_list("product_id", flat=True)
        )

    def get_items(self, obj):
        links = obj.promotion_products.select_related(
            "product",
            "product__category",
            "product__brand",
        ).prefetch_related(
            "product__images",
            "product__variants",
        )
        return [
            {
                "product": ProductSerializer(
                    link.product,
                    context=self.context,
                ).data,
                "discount_percent": (
                    link.discount_percent
                    if link.discount_percent is not None
                    else (
                        int(link.promotion.discount_value)
                        if link.promotion.discount_type == Promotion.DISCOUNT_PERCENT
                        else None
                    )
                ),
            }
            for link in links
        ]


class ProductReviewUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()


class ProductReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ProductReview
        fields = (
            "id",
            "product",
            "username",
            "rating",
            "title",
            "comment",
            "created_at",
        )
        read_only_fields = ("id", "username", "created_at")


class ProductReviewWriteSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True,
    )

    class Meta:
        model = ProductReview
        fields = ("product_id", "rating", "title", "comment")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)