from django.db import transaction
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q, Sum
from django.utils import timezone
from config.pagination import AdminResultsSetPagination
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Brand, Category, Product, Promotion
from catalog.serializers import ProductSerializer
from carts.models import Cart
from catalog.services.pricing import get_variant_pricing
from .serializers import (
    AdminVoucherSerializer,
    CheckoutSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    PublicVoucherSerializer,
    VoucherValidateSerializer,
    VoucherWriteSerializer,
)
from .models import Order, OrderItem, Voucher
from .permissions import IsAdminUser
from .services.vouchers import (
    compute_voucher_discount,
    get_voucher_by_code,
    validate_voucher,
)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items",
            "items__product",
            "items__variant",
        ).order_by("-created_at")

    @action(detail=False, methods=["post"], url_path="checkout")
    def checkout(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = Cart.objects.filter(user=request.user).prefetch_related(
            "items",
            "items__variant",
            "items__variant__product",
        ).first()

        if not cart or not cart.items.exists():
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            cart_items = list(cart.items.select_related("variant", "variant__product"))

            for item in cart_items:
                variant = item.variant
                if item.quantity > variant.stock:
                    return Response(
                        {
                            "detail": (
                                f"Not enough stock for {variant.product.name} "
                                f"({variant.name}). Available: {variant.stock}."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            subtotal = sum(item.total_price for item in cart_items)
            voucher_code = serializer.validated_data.get("voucher_code", "")
            discount_amount = 0
            voucher = None

            if voucher_code:
                voucher = get_voucher_by_code(voucher_code)
                validate_voucher(voucher, subtotal)
                discount_amount = compute_voucher_discount(subtotal, voucher)

            total_price = subtotal - discount_amount

            order = Order.objects.create(
                user=request.user,
                full_name=serializer.validated_data["full_name"],
                phone=serializer.validated_data["phone"],
                address=serializer.validated_data["address"],
                note=serializer.validated_data.get("note", ""),
                subtotal=subtotal,
                discount_amount=discount_amount,
                voucher_code=voucher.code if voucher else "",
                total_price=total_price,
            )

            order_items = []
            for item in cart_items:
                variant = item.variant
                product = variant.product
                item_total = item.total_price
                pricing = get_variant_pricing(variant)

                order_items.append(
                    OrderItem(
                        order=order,
                        product=product,
                        variant=variant,
                        product_name=product.name,
                        variant_name=variant.name,
                        compare_at_price=(
                            pricing["compare_at_price"]
                            if pricing["is_on_sale"]
                            else None
                        ),
                        price=pricing["effective_price"],
                        quantity=item.quantity,
                        total_price=item_total,
                    )
                )

                variant.stock -= item.quantity
                variant.save(update_fields=["stock"])

            OrderItem.objects.bulk_create(order_items)

            if voucher:
                Voucher.objects.filter(pk=voucher.pk).update(
                    used_count=voucher.used_count + 1
                )

            cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )
    
    @action(
        detail=False,
        methods=["get"],
        url_path="admin",
        permission_classes=[permissions.IsAuthenticated, IsAdminUser],
    )
    def admin_list(self, request):
        orders = Order.objects.select_related("user").prefetch_related(
            "items",
            "items__product",
            "items__variant",
        ).order_by("-created_at")

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            orders = orders.filter(status=status_param)

        search = request.query_params.get("search", "").strip()
        if search:
            search_filter = (
                Q(full_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(address__icontains=search)
                | Q(voucher_code__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
            )
            if search.isdigit():
                search_filter |= Q(id=int(search))
            orders = orders.filter(search_filter)

        paginator = AdminResultsSetPagination()
        page = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        url_path="status",
        permission_classes=[permissions.IsAuthenticated, IsAdminUser],
    )
    def update_status(self, request, pk=None):
        order = Order.objects.get(pk=pk)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status"])

        return Response(OrderSerializer(order).data)


class AdminVoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all().order_by("code")
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "description"]
    ordering_fields = ["code", "starts_at", "ends_at", "used_count"]
    ordering = ["code"]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return VoucherWriteSerializer

        return AdminVoucherSerializer


class ActiveVouchersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        vouchers = (
            Voucher.objects.filter(
                is_active=True,
                starts_at__lte=now,
                ends_at__gte=now,
            )
            .filter(
                Q(usage_limit__isnull=True)
                | Q(used_count__lt=F("usage_limit"))
            )
            .order_by("code")
        )
        serializer = PublicVoucherSerializer(vouchers, many=True)
        return Response(serializer.data)


class VoucherValidateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VoucherValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        voucher = serializer.validated_data["voucher"]

        return Response(
            {
                "code": voucher.code,
                "description": voucher.description,
                "discount_amount": serializer.validated_data["discount_amount"],
                "subtotal": serializer.validated_data["subtotal"],
                "total_price": (
                    serializer.validated_data["subtotal"]
                    - serializer.validated_data["discount_amount"]
                ),
            }
        )


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        User = get_user_model()
        revenue = (
            Order.objects.exclude(status="cancelled").aggregate(total=Sum("total_price"))[
                "total"
            ]
            or 0
        )
        status_counts = Order.objects.values("status").annotate(count=Count("id"))
        recent_orders = Order.objects.select_related("user").prefetch_related(
            "items",
            "items__product",
            "items__variant",
        ).order_by("-created_at")[:5]
        low_stock_products = Product.objects.select_related(
            "category",
            "brand",
        ).prefetch_related("images", "variants").annotate(
            active_stock=Sum(
                "variants__stock",
                filter=Q(variants__is_active=True),
            )
        ).filter(
            active_stock__lte=5,
        ).order_by("active_stock", "name")[:5]
        now = timezone.now()
        pending_orders = Order.objects.filter(status="pending").count()
        active_promotions = Promotion.objects.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        ).count()
        active_vouchers = Voucher.objects.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        ).filter(
            Q(usage_limit__isnull=True) | Q(used_count__lt=F("usage_limit"))
        ).count()

        return Response(
            {
                "total_revenue": revenue,
                "total_orders": Order.objects.count(),
                "pending_orders": pending_orders,
                "total_products": Product.objects.filter(is_active=True).count(),
                "total_categories": Category.objects.count(),
                "total_brands": Brand.objects.count(),
                "total_customers": User.objects.filter(is_staff=False).count(),
                "active_promotions": active_promotions,
                "active_vouchers": active_vouchers,
                "status_counts": list(status_counts),
                "recent_orders": OrderSerializer(recent_orders, many=True).data,
                "low_stock_products": ProductSerializer(
                    low_stock_products,
                    many=True,
                    context={"request": request},
                ).data,
            }
        )
