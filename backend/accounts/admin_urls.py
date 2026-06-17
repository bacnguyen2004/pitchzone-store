from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalog.views import AdminPromotionViewSet
from orders.views import AdminVoucherViewSet

from .views import AdminUserViewSet

router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="admin-users")
router.register("promotions", AdminPromotionViewSet, basename="admin-promotions")
router.register("vouchers", AdminVoucherViewSet, basename="admin-vouchers")

urlpatterns = [
    path("", include(router.urls)),
]