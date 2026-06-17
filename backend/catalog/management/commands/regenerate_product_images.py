from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from catalog.models import Product, ProductImage
from catalog.services.product_image_generator import build_product_image


class Command(BaseCommand):
    help = "Generate polished product images and attach them to catalog products."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Replace existing product images.",
        )

    def handle(self, *args, **options):
        force = options["force"]
        media_root = Path(settings.MEDIA_ROOT) / "products"
        media_root.mkdir(parents=True, exist_ok=True)

        created = 0
        replaced = 0
        skipped = 0

        for product in Product.objects.select_related("brand", "category").order_by("id"):
            if product.images.exists() and not force:
                skipped += 1
                continue

            if product.images.exists() and force:
                for image in product.images.all():
                    if image.image:
                        image.image.delete(save=False)
                    image.delete()
                replaced += 1

            image_bytes = build_product_image(
                product_name=product.name,
                brand_slug=product.brand.slug if product.brand else "pitchzone",
                brand_name=product.brand.name if product.brand else "PitchZone",
                category_slug=product.category.slug,
                product_slug=product.slug,
            )
            filename = f"{product.slug}.png"

            ProductImage.objects.create(
                product=product,
                image=ContentFile(image_bytes, name=filename),
                alt_text=product.name,
                is_main=True,
            )
            created += 1
            self.stdout.write(f"Generated image for {product.slug}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: {created} images generated, {replaced} products replaced, {skipped} skipped."
            )
        )