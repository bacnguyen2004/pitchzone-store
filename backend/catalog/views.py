from rest_framework import viewsets
from .models import Category, Brand, Product
from .serializers import CategorySerializer, BrandSerializer, ProductSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related(
        "category",
        "brand"
    ).prefetch_related("images")
    serializer_class = ProductSerializer