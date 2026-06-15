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

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            new_quantity = item.quantity + quantity
            if new_quantity > product.stock:
                return Response(
                    {"detail": "Not enough product stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = new_quantity
            item.save()

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["patch"], url_path="items/(?P<item_id>[^/.]+)")
    def update_item(self, request, item_id=None):
        cart = self.get_cart()
        item = CartItem.objects.get(cart=cart, id=item_id)

        serializer = CartItemSerializer(
            item,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @action(detail=False, methods=["delete"], url_path="items/(?P<item_id>[^/.]+)")
    def delete_item(self, request, item_id=None):
        cart = self.get_cart()
        item = CartItem.objects.get(cart=cart, id=item_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)