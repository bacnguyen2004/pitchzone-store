import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Tạo tài khoản admin (is_staff + superuser). "
        "Dùng biến môi trường DJANGO_SUPERUSER_* trên Render Shell."
    )

    def add_arguments(self, parser):
        parser.add_argument("--username", default=os.getenv("DJANGO_SUPERUSER_USERNAME", "admin"))
        parser.add_argument("--email", default=os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@pitchzone.local"))
        parser.add_argument(
            "--password",
            default=os.getenv("DJANGO_SUPERUSER_PASSWORD", ""),
            help="Hoặc đặt DJANGO_SUPERUSER_PASSWORD trong Environment",
        )

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]

        if not password:
            self.stderr.write(
                self.style.ERROR(
                    "Thiếu mật khẩu. Đặt DJANGO_SUPERUSER_PASSWORD hoặc --password=..."
                )
            )
            return

        User = get_user_model()
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.email = email
            user.save()
            self.stdout.write(self.style.WARNING(f"Đã cập nhật admin: {username}"))
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Đã tạo admin: {username}"))