"""Curated stock photo sources (Pexels) mapped to catalog product slugs."""

PEXELS_BASE = "https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"

# Mỗi slug có ảnh riêng, khớp loại sản phẩm (giày / áo / phụ kiện).
PRODUCT_PHOTO_IDS = {
    # Giày bóng đá
    "nike-mercurial-vapor-16-academy": 32573999,
    "adidas-predator-league-fg": 399187,
    "puma-future-7-match-fg": 114296,
    "mizuno-morelia-neo-club": 1188748,
    "joma-top-flex-turf": 1263324,
    # Áo đấu
    "manchester-united-home-jersey": 274422,
    "real-madrid-home-jersey": 274506,
    "barcelona-home-jersey": 274614,
    "argentina-home-jersey": 1263293,
    "vietnam-national-team-jersey": 1263291,
    # Quần short
    "nike-dri-fit-football-shorts": 1181314,
    "adidas-tiro-league-shorts": 1181350,
    # Tất
    "puma-team-football-socks": 1181264,
    "nike-grip-football-socks": 1181298,
    # Bóng
    "adidas-ucl-league-ball": 362110,
    "nike-academy-football": 209977,
    # Phụ kiện
    "adidas-tiro-shin-guards": 1181360,
    "nike-academy-boot-bag": 1181340,
}


def photo_url(photo_id: int, width: int = 1400) -> str:
    return (
        f"{PEXELS_BASE.format(photo_id=photo_id)}"
        f"?auto=compress&cs=tinysrgb&w={width}"
    )