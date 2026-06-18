from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed toàn bộ dữ liệu demo: catalog (SP, ảnh) + deal sốc + voucher."

    def handle(self, *args, **options):
        self.stdout.write("→ seed_catalog …")
        call_command("seed_catalog")

        self.stdout.write("→ download_product_images (Pexels) …")
        call_command("download_product_images", force=True, no_search=True)

        self.stdout.write("→ seed_promotions …")
        call_command("seed_promotions")

        self.stdout.write(self.style.SUCCESS("seed_all hoàn tất."))