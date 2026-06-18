from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def build_password_reset_url(user) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return (
        f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"
        f"?uid={uid}&token={token}"
    )


def send_password_reset_email(user) -> bool:
    if not user.email:
        return False

    reset_url = build_password_reset_url(user)
    sent = send_mail(
        subject="[PitchZone] Đặt lại mật khẩu",
        message=(
            f"Xin chào {user.username},\n\n"
            f"Bạn vừa yêu cầu đặt lại mật khẩu PitchZone.\n"
            f"Nhấn link sau để tạo mật khẩu mới:\n{reset_url}\n\n"
            "Link có hiệu lực trong thời gian giới hạn. "
            "Nếu bạn không yêu cầu, hãy bỏ qua email này."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=settings.EMAIL_FAIL_SILENTLY,
    )
    return sent > 0