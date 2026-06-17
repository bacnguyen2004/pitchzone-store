from django.contrib.auth import get_user_model
from config.pagination import AdminResultsSetPagination
from rest_framework import filters, generics, mixins, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, CustomerProfile
from .permissions import IsAdminUser
from .serializers import (
    AddressSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    ChangePasswordSerializer,
    CustomerProfileSerializer,
    CustomerProfileUpdateSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = User.objects.select_related("customer_profile").get(pk=request.user.pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = User.objects.select_related("customer_profile").get(pk=request.user.pk)
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Đã đổi mật khẩu thành công."})


class CustomerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_profile(self):
        profile, _ = CustomerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        serializer = CustomerProfileSerializer(self.get_profile())
        return Response(serializer.data)

    def patch(self, request):
        profile = self.get_profile()
        serializer = CustomerProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CustomerProfileSerializer(profile).data)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AdminUserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    pagination_class = AdminResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "username",
        "email",
        "customer_profile__full_name",
        "customer_profile__phone",
    ]
    ordering_fields = ["date_joined", "username", "email"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        return User.objects.select_related("customer_profile").order_by("-date_joined")

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
