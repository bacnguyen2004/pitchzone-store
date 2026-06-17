from __future__ import annotations

import time
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from PIL import Image, UnidentifiedImageError

from catalog.models import Product, ProductImage

try:
    from catalog.services.product_image_sources import PRODUCT_PHOTO_IDS, photo_url
except ImportError:
    PRODUCT_PHOTO_IDS = {}
    photo_url = None

try:
    from ddgs import DDGS
except ImportError:
    DDGS = None


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
OUTPUT_SIZE = 1200
JPEG_QUALITY = 88
MIN_IMAGE_SIDE = 300


def download_bytes(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def normalize_product_image(raw_bytes: bytes) -> bytes:
    image = Image.open(BytesIO(raw_bytes))
    image = image.convert("RGB")

    if min(image.size) < MIN_IMAGE_SIDE:
        raise ValueError(f"Image too small: {image.size}")

    canvas = Image.new("RGB", (OUTPUT_SIZE, OUTPUT_SIZE), (248, 250, 252))
    image.thumbnail((OUTPUT_SIZE - 120, OUTPUT_SIZE - 120), Image.Resampling.LANCZOS)

    offset = (
        (OUTPUT_SIZE - image.width) // 2,
        (OUTPUT_SIZE - image.height) // 2,
    )
    canvas.paste(image, offset)

    buffer = BytesIO()
    canvas.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buffer.getvalue()


def remove_stale_product_files(media_root: Path, slug: str) -> None:
    for pattern in (f"{slug}.jpg", f"{slug}.png", f"{slug}_*.jpg", f"{slug}_*.png"):
        for file_path in media_root.glob(pattern):
            file_path.unlink(missing_ok=True)


def build_search_queries(product: Product) -> list[str]:
    brand = product.brand.name if product.brand else ""
    category = product.category.slug
    name = product.name

    if category == "football-boots":
        return [
            f"{name} {brand} giày bóng đá sản phẩm",
            f"{name} football boots product",
        ]

    if category == "clothing":
        if product.slug.startswith("quan-"):
            return [
                f"{name} {brand} quần bóng đá sản phẩm",
                f"{name} football shorts product",
            ]

        return [
            f"{name} {brand} áo bóng đá sản phẩm",
            f"{name} football jersey product",
        ]

    if product.slug.startswith("bong-"):
        return [
            f"{name} {brand} bóng đá size 5 sản phẩm",
            f"{name} football ball product",
        ]

    if product.slug.startswith("tat-"):
        return [
            f"{name} {brand} tất bóng đá sản phẩm",
            f"{name} football socks product",
        ]

    if product.slug.startswith("ong-dong"):
        return [
            f"{name} {brand} ống đồng bóng đá sản phẩm",
            f"{name} shin guards product",
        ]

    return [
        f"{name} {brand} phụ kiện bóng đá sản phẩm",
        f"{name} football accessory product",
    ]


class Command(BaseCommand):
    help = "Download product photos into media/products and attach them to ProductImage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Replace existing product images.",
        )
        parser.add_argument(
            "--slug",
            type=str,
            help="Download image for a single product slug only.",
        )
        parser.add_argument(
            "--no-search",
            action="store_true",
            help="Disable web image search fallback.",
        )
        parser.add_argument(
            "--results",
            type=int,
            default=8,
            help="Maximum image search results to try per query.",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.25,
            help="Delay between product searches, in seconds.",
        )

    def handle(self, *args, **options):
        force = options["force"]
        slug_filter = options.get("slug")
        use_search = not options["no_search"]
        max_results = options["results"]
        delay = options["delay"]

        if use_search and DDGS is None:
            raise CommandError(
                "Package ddgs is required for search. Run: pip install ddgs"
            )

        media_root = Path(settings.MEDIA_ROOT) / "products"
        media_root.mkdir(parents=True, exist_ok=True)

        products = Product.objects.filter(is_active=True).select_related(
            "brand",
            "category",
        ).order_by("id")
        if slug_filter:
            products = products.filter(slug=slug_filter)

        downloaded = 0
        skipped = 0
        failed = 0

        with DDGS() if use_search else nullcontext() as ddgs:
            for product in products:
                if product.images.exists() and not force:
                    self.stdout.write(f"Skipped {product.slug} (already has image).")
                    skipped += 1
                    continue

                urls = self.get_candidate_urls(product, ddgs, max_results, use_search)
                if not urls:
                    self.stdout.write(
                        self.style.WARNING(f"No image source for {product.slug}.")
                    )
                    skipped += 1
                    continue

                processed = None
                used_url = None
                for url in urls:
                    try:
                        raw = download_bytes(url)
                        processed = normalize_product_image(raw)
                        used_url = url
                        break
                    except (
                        urllib.error.URLError,
                        OSError,
                        ValueError,
                        UnidentifiedImageError,
                    ):
                        continue

                if processed is None:
                    self.stdout.write(
                        self.style.ERROR(f"Failed {product.slug}: no valid image.")
                    )
                    failed += 1
                    continue

                filename = f"{product.slug}.jpg"

                if product.images.exists() and force:
                    for image in product.images.all():
                        if image.image:
                            image.image.delete(save=False)
                        image.delete()

                remove_stale_product_files(media_root, product.slug)

                product_image = ProductImage(
                    product=product,
                    alt_text=product.name,
                    is_main=True,
                )
                product_image.image.save(filename, ContentFile(processed), save=True)

                downloaded += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Downloaded {filename} from {used_url}")
                )
                time.sleep(delay)

        self.stdout.write(
            self.style.SUCCESS(
                f"Done: {downloaded} downloaded, {skipped} skipped, {failed} failed."
            )
        )

    def get_candidate_urls(self, product, ddgs, max_results, use_search):
        urls = []
        photo_id = PRODUCT_PHOTO_IDS.get(product.slug)
        if photo_id and photo_url:
            urls.append(photo_url(photo_id))

        if use_search:
            for query in build_search_queries(product):
                try:
                    results = ddgs.images(query, max_results=max_results)
                except Exception:
                    continue

                for item in results:
                    url = item.get("image")
                    if url and url not in urls:
                        urls.append(url)

        return urls


class nullcontext:
    def __enter__(self):
        return None

    def __exit__(self, *exc):
        return False
