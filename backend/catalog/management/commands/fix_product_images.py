from django.core.management import call_command
from django.core.management.base import BaseCommand

from catalog.models import ProductImage


class Command(BaseCommand):
    help = "Thay ảnh placeholder PNG bằng ảnh thật từ Pexels (dùng sau deploy Render)."

    def handle(self, *args, **options):
        placeholder_count = ProductImage.objects.filter(
            image__iendswith=".png",
        ).count()

        if placeholder_count == 0:
            self.stdout.write("Không có ảnh placeholder — bỏ qua.")
            return

        self.stdout.write(
            f"Tìm thấy {placeholder_count} ảnh placeholder — tải ảnh Pexels …"
        )
        call_command("download_product_images", force=True, no_search=True)
        self.stdout.write(self.style.SUCCESS("fix_product_images hoàn tất."))