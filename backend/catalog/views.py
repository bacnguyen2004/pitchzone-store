from django.db.models import IntegerField, Min, Prefetch, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .filters import ProductFilter
from .models import Category, Brand, Product, ProductVariant, Promotion
from .permissions import IsAdminOrReadOnly
from orders.permissions import IsAdminUser
from .serializers import (
    BrandSerializer,
    BrandWriteSerializer,
    CategorySerializer,
    CategoryWriteSerializer,
    ProductSerializer,
    ProductVariantSerializer,
    ProductVariantWriteSerializer,
    ProductWriteSerializer,
    PromotionSerializer,
    PromotionWriteSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "id"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return CategoryWriteSerializer
        return CategorySerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset.order_by("name")

        return queryset.filter(
            products__is_active=True,
            products__variants__is_active=True,
        ).distinct().order_by("name")


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "id"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return BrandWriteSerializer
        return BrandSerializer

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset.order_by("name")

        return queryset.filter(
            products__is_active=True,
            products__variants__is_active=True,
        ).distinct().order_by("name")


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "brand__name", "category__name"]
    ordering_fields = ["price", "created_at", "name", "sales"]
    ordering = ["-created_at"]

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)

        if lookup_value and lookup_value.isdigit():
            obj = get_object_or_404(queryset, pk=lookup_value)
        else:
            obj = get_object_or_404(queryset, slug=lookup_value)

        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        variant_queryset = ProductVariant.objects.order_by("size", "color")
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            variant_queryset = variant_queryset.filter(is_active=True)

        queryset = Product.objects.select_related("category", "brand").prefetch_related(
            "images",
            Prefetch("variants", queryset=variant_queryset),
        )

        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset.order_by("-created_at")

        return queryset.filter(is_active=True).order_by("-created_at")

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductWriteSerializer

        return ProductSerializer

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        ordering = self.request.query_params.get("ordering")

        if not ordering:
            return queryset

        descending = ordering.startswith("-")
        field = ordering[1:] if descending else ordering
        prefix = "-" if descending else ""

        if field == "price":
            return queryset.annotate(
                ordering_price=Min(
                    "variants__price",
                    filter=Q(variants__is_active=True),
                )
            ).order_by(f"{prefix}ordering_price", "id")

        if field == "sales":
            sold_statuses = ["processing", "shipping", "completed"]
            return queryset.annotate(
                sales=Coalesce(
                    Sum(
                        "order_items__quantity",
                        filter=Q(order_items__order__status__in=sold_statuses),
                    ),
                    Value(0),
                    output_field=IntegerField(),
                )
            ).order_by(f"{prefix}sales", "-created_at", "id")

        if field in {"created_at", "name"}:
            return queryset.order_by(f"{prefix}{field}", "id")

        return queryset


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.select_related(
        "product",
        "product__category",
        "product__brand",
    )
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["product", "product__slug", "size", "color", "is_active"]
    search_fields = ["sku", "product__name", "size", "color"]
    ordering_fields = ["price", "stock", "created_at"]
    ordering = ["product__name", "size", "color"]

    def get_queryset(self):
        queryset = self.queryset
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset

        return queryset.filter(is_active=True, product__is_active=True)

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductVariantWriteSerializer

        return ProductVariantSerializer


class PromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = self.queryset.prefetch_related(
            "promotion_products__product__category",
            "promotion_products__product__brand",
            "promotion_products__product__images",
            "promotion_products__product__variants",
        )

        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset.order_by("-starts_at")

        now = timezone.now()
        return queryset.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        ).order_by("-starts_at")

    @action(detail=False, methods=["get"], url_path="active")
    def active(self, request):
        promotion = self.get_queryset().first()
        if not promotion:
            return Response(None)

        serializer = self.get_serializer(promotion)
        return Response(serializer.data)


class AdminPromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.prefetch_related(
        "promotion_products",
        "promotion_products__product",
    ).order_by("-starts_at")
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug", "title"]
    ordering_fields = ["starts_at", "ends_at", "name"]
    ordering = ["-starts_at"]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return PromotionWriteSerializer

        return PromotionSerializer
