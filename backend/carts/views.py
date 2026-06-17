from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cart, CartItem
from .serializers import CartItemSerializer, CartSerializer


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request):
        serializer = CartSerializer(self.get_cart())
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="items")
    def add_item(self, request):
        cart = self.get_cart()
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        variant = serializer.validated_data["variant"]
        quantity = serializer.validated_data["quantity"]

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={"quantity": quantity},
        )

        if not created:
            new_quantity = item.quantity + quantity
            if new_quantity > variant.stock:
                return Response(
                    {
                        "detail": (
                            f"Not enough stock for {variant.product.name} "
                            f"({variant.name})."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_quantity
            item.save()

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["patch", "delete"],
        url_path="items/(?P<item_id>[^/.]+)",
    )
    def item_detail(self, request, item_id=None):
        cart = self.get_cart()
        item = get_object_or_404(CartItem, cart=cart, id=item_id)

        if request.method == "DELETE":
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = CartItemSerializer(
            item,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)
