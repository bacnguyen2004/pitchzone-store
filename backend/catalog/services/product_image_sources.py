"""Ảnh stock Pexels — slug khớp seed_catalog.py."""

PEXELS_BASE = "https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"

# Ảnh riêng cho sản phẩm nổi bật
PRODUCT_PHOTO_IDS = {
    "giay-nike-mercurial-vapor-16-academy": 32573999,
    "giay-adidas-predator-league-fg": 399187,
    "giay-puma-future-7-match-fg": 114296,
    "ao-manchester-united-san-nha": 274422,
    "ao-real-madrid-san-nha": 274506,
    "ao-barcelona-san-nha": 274614,
    "ao-doi-tuyen-argentina": 1263293,
    "quan-nike-dri-fit-bong-da": 1181314,
    "quan-adidas-tiro-league": 1181350,
    "bong-adidas-ucl-league": 362110,
    "bong-nike-academy-football": 209977,
    "tat-nike-grip-football": 1181298,
    "tat-puma-team-football": 1181264,
    "ong-dong-nike-mercurial-lite": 1181360,
    "tui-dung-giay-adidas-tiro": 1181340,
}

BOOT_PHOTO_IDS = (32573999, 399187, 114296, 1188748, 1263324)
JERSEY_PHOTO_IDS = (274422, 274506, 274614, 1263293, 1263291)
SHORT_PHOTO_IDS = (1181314, 1181350)
BALL_PHOTO_IDS = (362110, 209977)
SOCK_PHOTO_IDS = (1181264, 1181298)
ACCESSORY_PHOTO_IDS = (1181360, 1181340)


def _pick(pool: tuple[int, ...], slug: str) -> int:
    return pool[hash(slug) % len(pool)]


def resolve_photo_id(slug: str, category_slug: str = "") -> int | None:
    if slug in PRODUCT_PHOTO_IDS:
        return PRODUCT_PHOTO_IDS[slug]

    if slug.startswith("giay-"):
        return _pick(BOOT_PHOTO_IDS, slug)
    if slug.startswith("ao-"):
        return _pick(JERSEY_PHOTO_IDS, slug)
    if slug.startswith("quan-"):
        return _pick(SHORT_PHOTO_IDS, slug)
    if slug.startswith("bong-"):
        return _pick(BALL_PHOTO_IDS, slug)
    if slug.startswith("tat-"):
        return _pick(SOCK_PHOTO_IDS, slug)
    if slug.startswith("ong-dong") or slug.startswith("tui-"):
        return _pick(ACCESSORY_PHOTO_IDS, slug)

    if category_slug == "football-boots":
        return _pick(BOOT_PHOTO_IDS, slug)
    if category_slug == "clothing":
        return _pick(JERSEY_PHOTO_IDS, slug)
    if category_slug == "accessories":
        return _pick(ACCESSORY_PHOTO_IDS, slug)

    return None


def photo_url(photo_id: int, width: int = 1400) -> str:
    return (
        f"{PEXELS_BASE.format(photo_id=photo_id)}"
        f"?auto=compress&cs=tinysrgb&w={width}"
    )