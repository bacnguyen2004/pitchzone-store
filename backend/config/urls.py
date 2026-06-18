"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from config.health import health_check
from orders.payment_views import VNPayIPNView, VNPayReturnView

urlpatterns = [
    path("api/health/", health_check, name="health-check"),
    path("admin/", admin.site.urls),
    path("api/", include("catalog.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("accounts.admin_urls")),
    path("api/", include("carts.urls")),
    path("api/", include("orders.urls")),
    # Alias giống bookstore — URL có thể đã đăng ký trên merchant VNPay
    path("vnpay/return/", VNPayReturnView.as_view(), name="vnpay-return-alias"),
    path("vnpay/ipn/", VNPayIPNView.as_view(), name="vnpay-ipn-alias"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)