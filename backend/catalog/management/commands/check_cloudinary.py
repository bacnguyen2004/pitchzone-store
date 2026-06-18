from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Kiểm tra cấu hình Cloudinary và storage backend đang dùng."

    def handle(self, *args, **options):
        cloud_name = getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
        api_key = getattr(settings, "CLOUDINARY_API_KEY", "")
        api_secret = getattr(settings, "CLOUDINARY_API_SECRET", "")
        use_cloudinary = getattr(settings, "USE_CLOUDINARY", False)

        default_backend = settings.STORAGES["default"]["BACKEND"]

        self.stdout.write(f"USE_CLOUDINARY: {use_cloudinary}")
        self.stdout.write(f"Cloud name: {cloud_name or '(empty)'}")
        self.stdout.write(f"API key: {api_key or '(empty)'}")
        self.stdout.write(
            f"API secret: {'*' * min(len(api_secret), 8) if api_secret else '(empty)'}"
        )
        self.stdout.write(f"Default storage: {default_backend}")

        if "cloudinary" in default_backend.lower():
            self.stdout.write(self.style.SUCCESS("Media đang upload lên Cloudinary."))
        else:
            self.stdout.write(
                self.style.WARNING(
                    "Media đang lưu local (backend/media/). "
                    "Thêm CLOUDINARY_* vào backend/.env để bật Cloudinary."
                )
            )