import django_filters
from django.db.models import F, Q
from django.utils import timezone

from .models import Product, PromotionProduct


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(
        field_name="category__slug",
        lookup_expr="iexact"
    )
    brand = django_filters.CharFilter(
        field_name="brand__slug",
        lookup_expr="iexact"
    )
    min_price = django_filters.NumberFilter(
        method="filter_min_price"
    )
    max_price = django_filters.NumberFilter(
        method="filter_max_price"
    )
    size = django_filters.CharFilter(
        field_name="variants__size",
        lookup_expr="iexact"
    )
    in_stock = django_filters.BooleanFilter(
        method="filter_in_stock"
    )
    on_sale = django_filters.BooleanFilter(
        method="filter_on_sale"
    )
    is_active = django_filters.BooleanFilter()

    def filter_min_price(self, queryset, name, value):
        return queryset.filter(
            variants__is_active=True,
            variants__price__gte=value,
        ).distinct()

    def filter_max_price(self, queryset, name, value):
        return queryset.filter(
            variants__is_active=True,
            variants__price__lte=value,
        ).distinct()

    def filter_on_sale(self, queryset, name, value):
        if not value:
            return queryset

        now = timezone.now()
        promo_product_ids = PromotionProduct.objects.filter(
            promotion__is_active=True,
            promotion__starts_at__lte=now,
            promotion__ends_at__gte=now,
        ).values_list("product_id", flat=True)

        return queryset.filter(
            Q(
                variants__is_active=True,
                variants__sale_price__isnull=False,
                variants__sale_price__lt=F("variants__price"),
            )
            | Q(id__in=promo_product_ids)
        ).distinct()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(
                variants__is_active=True,
                variants__stock__gt=0,
            ).distinct()

        return queryset

    class Meta:
        model = Product
        fields = [
            "category",
            "brand",
            "min_price",
            "max_price",
            "size",
            "in_stock",
            "on_sale",
            "is_active",
        ]
