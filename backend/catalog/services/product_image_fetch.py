"""Tải ảnh sản phẩm từ Pexels."""

from __future__ import annotations

import urllib.error
import urllib.request
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from catalog.services.product_image_sources import photo_url, resolve_photo_id

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
OUTPUT_SIZE = 1200
JPEG_QUALITY = 88
MIN_IMAGE_SIDE = 300


def is_placeholder_image(file_field) -> bool:
    if not file_field:
        return True

    name = (getattr(file_field, "name", "") or "").lower()
    url = (getattr(file_field, "url", "") or "").lower().split("?")[0]

    if name.endswith(".png") or url.endswith(".png"):
        return True

    # Ảnh vẽ placeholder thường rất nhẹ
    try:
        if file_field.size and file_field.size < 80_000:
            return name.endswith(".png") or "placeholder" in name
    except (OSError, ValueError):
        pass

    return False


def pexels_url_for_product(product) -> str | None:
    category_slug = product.category.slug if product.category else ""
    photo_id = resolve_photo_id(product.slug, category_slug)
    if not photo_id:
        return None
    return photo_url(photo_id)


def absolute_media_url(request, file_field) -> str | None:
    if not file_field:
        return None

    url = file_field.url
    if url.startswith(("http://", "https://")):
        return url
    if request:
        return request.build_absolute_uri(url)
    return url


def resolve_display_image_url(request, product, file_field) -> str | None:
    """API trả URL hiển thị — fallback Pexels nếu vẫn là placeholder."""
    if is_placeholder_image(file_field):
        fallback = pexels_url_for_product(product)
        if fallback:
            return fallback
    if not file_field:
        return pexels_url_for_product(product)

    return absolute_media_url(request, file_field)


def download_bytes(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
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


def fetch_product_image_bytes(product) -> tuple[bytes, str] | None:
    url = pexels_url_for_product(product)
    if not url:
        return None

    try:
        raw = download_bytes(url)
        processed = normalize_product_image(raw)
        return processed, url
    except (
        urllib.error.URLError,
        OSError,
        ValueError,
        UnidentifiedImageError,
    ):
        return None