from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import (
    ActiveVouchersView,
    AdminDashboardView,
    OrderViewSet,
    VoucherValidateView,
)

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="orders")

urlpatterns = [
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("vouchers/", ActiveVouchersView.as_view(), name="voucher-list"),
    path("vouchers/validate/", VoucherValidateView.as_view(), name="voucher-validate"),
]

urlpatterns += router.urls
