from rest_framework.routers import DefaultRouter
from django.urls import path

from .payment_views import VNPayIPNView, VNPayReturnView, VNPayVerifyView
from .webhook_views import GHNWebhookView
from .views import (
    ActiveVouchersView,
    AdminDashboardView,
    OrderViewSet,
    VoucherValidateView,
)

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="orders")

urlpatterns = [
    path("payments/vnpay/return/", VNPayReturnView.as_view(), name="vnpay-return"),
    path("payments/vnpay/ipn/", VNPayIPNView.as_view(), name="vnpay-ipn"),
    path("payments/vnpay/verify/", VNPayVerifyView.as_view(), name="vnpay-verify"),
    path("webhooks/ghn/", GHNWebhookView.as_view(), name="ghn-webhook"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("vouchers/", ActiveVouchersView.as_view(), name="voucher-list"),
    path("vouchers/validate/", VoucherValidateView.as_view(), name="voucher-validate"),
]

urlpatterns += router.urls
