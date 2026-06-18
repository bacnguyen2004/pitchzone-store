from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from config.pagination import AdminResultsSetPagination
from rest_framework import filters, generics, mixins, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address, CustomerProfile
from .services.email import send_password_reset_email
from .permissions import IsAdminUser
from .serializers import (
    AddressSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    ChangePasswordSerializer,
    CustomerProfileSerializer,
    CustomerProfileUpdateSerializer,
    ForgotPasswordSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email__iexact=email)

        if not send_password_reset_email(user):
            return Response(
                {
                    "detail": (
                        "Không gửi được email. "
                        "Kiểm tra cấu hình SMTP hoặc thử lại sau."
                    )
                },
                status=503,
            )

        return Response(
            {"detail": "Đã gửi link đặt lại mật khẩu đến email của bạn."}
        )


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(
                urlsafe_base64_decode(serializer.validated_data["uid"])
            )
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": "Liên kết đặt lại mật khẩu không hợp lệ."},
                status=400,
            )

        token = serializer.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Liên kết đặt lại mật khẩu đã hết hạn."},
                status=400,
            )

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Đã đặt lại mật khẩu thành công."})


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
        queryset = User.objects.select_related("customer_profile").order_by(
            "-date_joined"
        )
        is_staff = self.request.query_params.get("is_staff")
        if is_staff is not None:
            queryset = queryset.filter(
                is_staff=str(is_staff).lower() in {"1", "true", "yes"}
            )
        return queryset

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
