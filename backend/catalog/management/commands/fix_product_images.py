from django.core.management import call_command
from django.core.management.base import BaseCommand

from catalog.models import ProductImage
from catalog.services.product_image_fetch import is_placeholder_image


class Command(BaseCommand):
    help = "Thay ảnh placeholder PNG bằng ảnh thật từ Pexels (dùng sau deploy Render)."

    def handle(self, *args, **options):
        placeholders = [
            image
            for image in ProductImage.objects.select_related("product")
            if is_placeholder_image(image.image)
        ]

        if not placeholders:
            self.stdout.write("Không có ảnh placeholder — bỏ qua.")
            return

        self.stdout.write(
            f"Tìm thấy {len(placeholders)} ảnh placeholder — tải ảnh Pexels …"
        )
        call_command("download_product_images", force=True, no_search=True)
        self.stdout.write(self.style.SUCCESS("fix_product_images hoàn tất."))