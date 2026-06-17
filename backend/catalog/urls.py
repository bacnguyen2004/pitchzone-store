from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet,
    CategoryViewSet,
    ProductVariantViewSet,
    ProductViewSet,
    PromotionViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet)
router.register("brands", BrandViewSet)
router.register("products", ProductViewSet)
router.register("variants", ProductVariantViewSet)
router.register("promotions", PromotionViewSet)

urlpatterns = router.urls
