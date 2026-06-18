from django.contrib.auth import get_user_model

from rest_framework import serializers

from .models import Address, CustomerProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = (
            "id",
            "full_name",
            "phone",
            "date_of_birth",
            "avatar",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class CustomerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ("full_name", "phone", "date_of_birth", "avatar")
        extra_kwargs = {
            "full_name": {"required": False},
            "phone": {"required": False},
            "date_of_birth": {"required": False},
            "avatar": {"required": False},
        }


class AddressSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Address
        fields = (
            "id",
            "user",
            "full_name",
            "phone",
            "street_address",
            "ward",
            "city",
            "full_address",
            "is_default",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "full_address", "created_at", "updated_at")


class UserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "is_staff", "role", "customer_profile")

    def get_role(self, obj):
        return "admin" if obj.is_staff else "customer"


def _validate_unique_email(value, instance=None):
    queryset = User.objects.filter(email__iexact=value)

    if instance:
        queryset = queryset.exclude(pk=instance.pk)

    if value and queryset.exists():
        raise serializers.ValidationError("Email is already in use.")

    return value


def _update_customer_profile(user, profile_data):
    if profile_data is None:
        return

    profile, _ = CustomerProfile.objects.get_or_create(user=user)
    profile_serializer = CustomerProfileUpdateSerializer(
        profile,
        data=profile_data,
        partial=True,
    )
    profile_serializer.is_valid(raise_exception=True)
    profile_serializer.save()


class ProfileUpdateSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileUpdateSerializer(required=False)

    class Meta:
        model = User
        fields = ("username", "email", "customer_profile")
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
        }

    def validate_email(self, value):
        return _validate_unique_email(value, self.instance)

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("customer_profile", None)
        user = super().update(instance, validated_data)
        _update_customer_profile(user, profile_data)
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "is_staff",
            "role",
            "customer_profile",
            "date_joined",
            "last_login",
        )

    def get_role(self, obj):
        return "admin" if obj.is_staff else "customer"


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileUpdateSerializer(required=False)

    class Meta:
        model = User
        fields = ("username", "email", "is_staff", "customer_profile")
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
            "is_staff": {"required": False},
        }

    def validate_email(self, value):
        return _validate_unique_email(value, self.instance)

    def validate_is_staff(self, value):
        request = self.context.get("request")
        if request and request.user.pk == self.instance.pk and not value:
            raise serializers.ValidationError(
                "You cannot remove your own admin access."
            )
        return value

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("customer_profile", None)
        user = super().update(instance, validated_data)
        _update_customer_profile(user, profile_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu hiện tại không đúng.")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.strip().lower()
        if not User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Email không tồn tại trong hệ thống.")
        return email


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Mật khẩu xác nhận không khớp."}
            )
        return attrs
