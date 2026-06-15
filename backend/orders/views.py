
from django.db import transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from carts.models import Cart
from .models import Order, OrderItem
from .serializers import CheckoutSerializer, OrderSerializer

from .permissions import IsAdminUser
from .serializers import CheckoutSerializer, OrderSerializer, OrderStatusUpdateSerializer


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "items",
            "items__product",
        ).order_by("-created_at")

    @action(detail=False, methods=["post"], url_path="checkout")
    def checkout(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = Cart.objects.filter(user=request.user).prefetch_related(
            "items",
            "items__product",
        ).first()

        if not cart or not cart.items.exists():
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            cart_items = list(cart.items.select_related("product"))

            for item in cart_items:
                if item.quantity > item.product.stock:
                    return Response(
                        {
                            "detail": (
                                f"Not enough stock for {item.product.name}. "
                                f"Available: {item.product.stock}."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            total_price = sum(item.total_price for item in cart_items)

            order = Order.objects.create(
                user=request.user,
                full_name=serializer.validated_data["full_name"],
                phone=serializer.validated_data["phone"],
                address=serializer.validated_data["address"],
                note=serializer.validated_data.get("note", ""),
                total_price=total_price,
            )

            order_items = []
            for item in cart_items:
                product = item.product
                item_total = item.total_price

                order_items.append(
                    OrderItem(
                        order=order,
                        product=product,
                        product_name=product.name,
                        price=product.price,
                        quantity=item.quantity,
                        total_price=item_total,
                    )
                )

                product.stock -= item.quantity
                product.save(update_fields=["stock"])

            OrderItem.objects.bulk_create(order_items)
            cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )
    
    @action(detail=False, methods=["get"], url_path="admin")
    def admin_list(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN,
            )

        orders = Order.objects.all().prefetch_related(
            "items",
            "items__product",
        ).order_by("-created_at")

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN,
            )

        order = Order.objects.get(pk=pk)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status"])

        return Response(OrderSerializer(order).data)