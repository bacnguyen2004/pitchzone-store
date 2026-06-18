import os

from django.core.management import call_command
from django.core.management.base import BaseCommand

from catalog.models import Product, ProductImage


class Command(BaseCommand):
    help = (
        "Chạy khi container start (Render free — không cần Shell): "
        "tạo admin + seed data nếu DB trống."
    )

    def handle(self, *args, **options):
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "")
        if password:
            self.stdout.write("→ create_admin …")
            call_command("create_admin")
        else:
            self.stdout.write(
                self.style.WARNING(
                    "Bỏ qua create_admin — chưa đặt DJANGO_SUPERUSER_PASSWORD."
                )
            )

        seed_mode = os.getenv("SEED_ON_DEPLOY", "auto").lower()
        has_products = Product.objects.filter(is_active=True).exists()

        if seed_mode not in {"false", "0", "no", "off"}:
            if seed_mode == "force":
                self.stdout.write("→ seed_all (force) …")
                call_command("seed_all")
            elif not has_products:
                self.stdout.write("→ seed_all (DB trống) …")
                call_command("seed_all")
            else:
                self.stdout.write("DB đã có sản phẩm — bỏ qua seed_all.")
        else:
            self.stdout.write("SEED_ON_DEPLOY=off — bỏ qua seed.")

        self._fix_placeholder_images()
        self.stdout.write(self.style.SUCCESS("bootstrap_deploy hoàn tất."))

    def _fix_placeholder_images(self):
        fix_flag = os.getenv("FIX_PRODUCT_IMAGES", "").lower() in {
            "true",
            "1",
            "yes",
            "force",
        }
        has_placeholders = ProductImage.objects.filter(
            image__iendswith=".png",
        ).exists()

        if not fix_flag and not has_placeholders:
            return

        self.stdout.write("→ fix_product_images …")
        call_command("fix_product_images")