from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet,
    CategoryViewSet,
    ProductReviewViewSet,
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
router.register("reviews", ProductReviewViewSet, basename="review")

urlpatterns = router.urls
