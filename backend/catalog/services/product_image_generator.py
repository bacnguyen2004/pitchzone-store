from __future__ import annotations

from io import BytesIO

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SIZE = 1000

BRAND_COLORS = {
    "apple": ("#1d1d1f", "#e8e8ed"),
    "dell": ("#007db8", "#dbeafe"),
    "asus": ("#111827", "#ef4444"),
    "logitech": ("#0ea5e9", "#e0f2fe"),
    "keychron": ("#111827", "#f59e0b"),
    "sony": ("#111827", "#f4f4f5"),
    "anker": ("#0284c7", "#e0f2fe"),
    "tomtoc": ("#334155", "#cbd5e1"),
    "nike": ("#111827", "#dbeafe"),
    "adidas": ("#0f172a", "#f8fafc"),
    "puma": ("#dc2626", "#fee2e2"),
    "mizuno": ("#1d4ed8", "#dbeafe"),
    "joma": ("#b91c1c", "#fee2e2"),
}

CATEGORY_DRAWERS = {
    "laptop",
    "keyboard",
    "mouse",
    "headphone",
    "charger",
    "backpack",
    "football-boots",
    "clothing",
    "jerseys",
    "shorts",
    "socks",
    "balls",
    "accessories",
}


def _hex(color: str) -> tuple[int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[index : index + 2], 16) for index in (0, 2, 4))


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "C:/Windows/Fonts/segoeuib.ttf",
                "C:/Windows/Fonts/arialbd.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            ]
        )
    else:
        candidates.extend(
            [
                "C:/Windows/Fonts/segoeui.ttf",
                "C:/Windows/Fonts/arial.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            ]
        )

    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue

    return ImageFont.load_default()


def _rounded_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def _draw_shadow(image: Image.Image, box, blur=18, opacity=42):
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(box, radius=28, fill=(15, 23, 42, opacity))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    image.alpha_composite(shadow)


def _background() -> Image.Image:
    image = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
    draw = ImageDraw.Draw(image)

    for y in range(SIZE):
        ratio = y / SIZE
        shade = int(248 - ratio * 10)
        draw.line([(0, y), (SIZE, y)], fill=(shade, shade + 2, shade + 4, 255))

    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((140, 90, 860, 620), fill=(37, 99, 235, 18))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    image.alpha_composite(glow)
    return image


def _draw_laptop(draw, image, primary, accent):
    _draw_shadow(image, (210, 560, 790, 690))
    _rounded_rect(draw, (180, 300, 820, 620), 24, _hex(accent))
    _rounded_rect(draw, (210, 320, 790, 560), 16, _hex("#0f172a"))
    _rounded_rect(draw, (250, 360, 750, 520), 10, _hex("#1e293b"))

    for x in range(270, 730, 70):
        draw.line([(x, 390), (x, 500)], fill=_hex("#334155"), width=2)

    _rounded_rect(draw, (250, 585, 750, 640), 18, _hex(primary))
    draw.rounded_rectangle((250, 585, 750, 610), radius=18, fill=_hex("#cbd5e1"))


def _draw_keyboard(draw, image, primary, accent):
    _draw_shadow(image, (220, 560, 780, 690))
    _rounded_rect(draw, (200, 360, 800, 620), 28, _hex(accent))
    _rounded_rect(draw, (230, 390, 770, 590), 18, _hex("#111827"))

    start_x, start_y = 255, 420
    key_w, key_h, gap = 42, 34, 10
    for row in range(4):
        for col in range(10):
            x1 = start_x + col * (key_w + gap)
            y1 = start_y + row * (key_h + gap)
            color = _hex(primary) if (row, col) == (3, 9) else _hex("#334155")
            _rounded_rect(draw, (x1, y1, x1 + key_w, y1 + key_h), 8, color)


def _draw_mouse(draw, image, primary, accent):
    _draw_shadow(image, (300, 560, 700, 700))
    draw.ellipse((300, 360, 700, 640), fill=_hex(accent))
    draw.ellipse((330, 390, 670, 610), fill=_hex(primary))
    draw.ellipse((470, 410, 530, 470), fill=_hex("#64748b"))
    draw.polygon([(500, 410), (540, 470), (460, 470)], fill=_hex("#94a3b8"))


def _draw_headphone(draw, image, primary, accent, slug: str):
    _draw_shadow(image, (250, 560, 750, 700))
    if "wf-" in slug:
        _rounded_rect(draw, (360, 390, 640, 590), 40, _hex(accent))
        _rounded_rect(draw, (390, 420, 610, 560), 28, _hex(primary))
        draw.ellipse((410, 470, 470, 530), fill=_hex("#e2e8f0"))
        draw.ellipse((530, 470, 590, 530), fill=_hex("#e2e8f0"))
        return

    draw.arc((250, 250, 750, 620), start=190, end=350, fill=_hex(primary), width=28)
    _rounded_rect(draw, (250, 430, 340, 590), 30, _hex(accent))
    _rounded_rect(draw, (660, 430, 750, 590), 30, _hex(accent))
    _rounded_rect(draw, (270, 450, 320, 570), 20, _hex("#e2e8f0"))
    _rounded_rect(draw, (680, 450, 730, 570), 20, _hex("#e2e8f0"))


def _draw_charger(draw, image, primary, accent, slug: str):
    _draw_shadow(image, (300, 560, 700, 700))
    if "power-bank" in slug or "737" in slug:
        _rounded_rect(draw, (330, 360, 670, 600), 36, _hex(accent))
        _rounded_rect(draw, (360, 390, 640, 570), 24, _hex(primary))
        for offset in (420, 470, 520):
            _rounded_rect(draw, (offset, 470, offset + 24, 500), 6, _hex("#38bdf8"))
        return

    _rounded_rect(draw, (390, 360, 610, 560), 28, _hex(accent))
    _rounded_rect(draw, (420, 390, 580, 530), 18, _hex(primary))
    draw.rectangle((500, 530, 520, 610), fill=_hex("#94a3b8"))
    _rounded_rect(draw, (470, 600, 550, 630), 8, _hex("#64748b"))


def _draw_backpack(draw, image, primary, accent, slug: str):
    _draw_shadow(image, (280, 560, 720, 710))
    if "sleeve" in slug:
        _rounded_rect(draw, (260, 390, 740, 610), 24, _hex(accent))
        _rounded_rect(draw, (290, 420, 710, 580), 16, _hex(primary))
        draw.line([(500, 420), (500, 580)], fill=_hex("#64748b"), width=4)
        return

    _rounded_rect(draw, (320, 360, 680, 620), 40, _hex(accent))
    _rounded_rect(draw, (350, 410, 650, 590), 24, _hex(primary))
    draw.arc((390, 300, 610, 430), start=200, end=340, fill=_hex(primary), width=16)
    _rounded_rect(draw, (390, 470, 610, 540), 14, _hex("#475569"))


def _draw_football_boots(draw, image, primary, accent):
    _draw_shadow(image, (240, 570, 790, 715))
    draw.polygon(
        [
            (250, 520),
            (380, 430),
            (590, 420),
            (770, 535),
            (720, 605),
            (430, 605),
        ],
        fill=_hex(accent),
    )
    draw.polygon(
        [
            (300, 525),
            (410, 465),
            (575, 470),
            (700, 540),
            (660, 565),
            (410, 565),
        ],
        fill=_hex(primary),
    )
    for x in (360, 430, 500, 570):
        draw.line([(x, 485), (x + 40, 540)], fill=_hex("#e2e8f0"), width=5)
    for x in (360, 470, 580, 690):
        draw.polygon([(x, 610), (x + 24, 610), (x + 12, 650)], fill=_hex(primary))


def _draw_jersey(draw, image, primary, accent):
    _draw_shadow(image, (250, 560, 750, 720))
    draw.polygon(
        [
            (350, 300),
            (430, 250),
            (500, 310),
            (570, 250),
            (650, 300),
            (760, 430),
            (690, 500),
            (650, 460),
            (650, 650),
            (350, 650),
            (350, 460),
            (310, 500),
            (240, 430),
        ],
        fill=_hex(accent),
    )
    _rounded_rect(draw, (385, 360, 615, 620), 20, _hex(primary))
    draw.arc((430, 255, 570, 380), start=15, end=165, fill=_hex("#e2e8f0"), width=12)
    draw.line([(445, 390), (555, 390)], fill=_hex("#e2e8f0"), width=8)


def _draw_shorts(draw, image, primary, accent):
    _draw_shadow(image, (300, 570, 700, 720))
    _rounded_rect(draw, (320, 350, 680, 440), 20, _hex(primary))
    draw.polygon([(330, 430), (500, 430), (470, 650), (300, 650)], fill=_hex(accent))
    draw.polygon([(500, 430), (670, 430), (700, 650), (530, 650)], fill=_hex(accent))
    draw.line([(500, 430), (500, 640)], fill=_hex(primary), width=8)


def _draw_socks(draw, image, primary, accent):
    _draw_shadow(image, (310, 570, 700, 720))
    _rounded_rect(draw, (340, 320, 455, 610), 30, _hex(accent))
    _rounded_rect(draw, (545, 320, 660, 610), 30, _hex(accent))
    _rounded_rect(draw, (320, 560, 455, 650), 36, _hex(primary))
    _rounded_rect(draw, (545, 560, 680, 650), 36, _hex(primary))
    draw.line([(350, 400), (445, 400)], fill=_hex(primary), width=10)
    draw.line([(555, 400), (650, 400)], fill=_hex(primary), width=10)


def _draw_ball(draw, image, primary, accent):
    _draw_shadow(image, (270, 560, 730, 730))
    draw.ellipse((275, 300, 725, 750), fill=_hex(accent), outline=_hex(primary), width=12)
    draw.polygon(
        [(500, 420), (560, 465), (535, 540), (465, 540), (440, 465)],
        fill=_hex(primary),
    )
    draw.arc((330, 330, 520, 620), 290, 70, fill=_hex(primary), width=8)
    draw.arc((480, 330, 670, 620), 110, 250, fill=_hex(primary), width=8)
    draw.arc((355, 560, 645, 760), 195, 345, fill=_hex(primary), width=8)


def _draw_accessory(draw, image, primary, accent, slug: str):
    _draw_shadow(image, (290, 570, 710, 720))
    if "shin" in slug:
        _rounded_rect(draw, (360, 300, 480, 650), 48, _hex(accent))
        _rounded_rect(draw, (520, 300, 640, 650), 48, _hex(accent))
        _rounded_rect(draw, (385, 350, 455, 590), 30, _hex(primary))
        _rounded_rect(draw, (545, 350, 615, 590), 30, _hex(primary))
        return

    _rounded_rect(draw, (310, 360, 690, 620), 42, _hex(accent))
    _rounded_rect(draw, (350, 400, 650, 580), 28, _hex(primary))
    draw.arc((390, 270, 610, 430), start=200, end=340, fill=_hex(primary), width=18)


def _draw_product_shape(image, draw, category: str, brand: str, slug: str):
    primary, accent = BRAND_COLORS.get(brand, ("#1e293b", "#e2e8f0"))

    if category == "laptop":
        _draw_laptop(draw, image, primary, accent)
    elif category == "keyboard":
        _draw_keyboard(draw, image, primary, accent)
    elif category == "mouse":
        _draw_mouse(draw, image, primary, accent)
    elif category == "headphone":
        _draw_headphone(draw, image, primary, accent, slug)
    elif category == "charger":
        _draw_charger(draw, image, primary, accent, slug)
    elif category == "backpack":
        _draw_backpack(draw, image, primary, accent, slug)
    elif category == "football-boots":
        _draw_football_boots(draw, image, primary, accent)
    elif category == "clothing":
        if "shorts" in slug or "quan-" in slug:
            _draw_shorts(draw, image, primary, accent)
        else:
            _draw_jersey(draw, image, primary, accent)
    elif category == "jerseys":
        _draw_jersey(draw, image, primary, accent)
    elif category == "shorts":
        _draw_shorts(draw, image, primary, accent)
    elif category == "socks":
        _draw_socks(draw, image, primary, accent)
    elif category == "balls":
        _draw_ball(draw, image, primary, accent)
    elif category == "accessories":
        if "socks" in slug or "tat-" in slug:
            _draw_socks(draw, image, primary, accent)
        elif "ball" in slug or "football" in slug or "bong-" in slug:
            _draw_ball(draw, image, primary, accent)
        elif "shin" in slug or "ong-dong" in slug:
            _draw_accessory(draw, image, primary, accent, "shin")
        else:
            _draw_accessory(draw, image, primary, accent, slug)


def _draw_label(image: Image.Image, brand_name: str, product_name: str):
    draw = ImageDraw.Draw(image)
    brand_font = _load_font(24, bold=True)
    name_font = _load_font(34, bold=True)

    brand_text = brand_name.upper()
    name_lines = []
    words = product_name.split()
    current = []
    for word in words:
        candidate = " ".join(current + [word])
        if len(candidate) > 22 and current:
            name_lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        name_lines.append(" ".join(current))

    line_height = 42
    total_height = 34 + len(name_lines) * line_height
    start_y = SIZE - 110 - total_height

    draw.text((SIZE / 2, start_y), brand_text, font=brand_font, fill=_hex("#64748b"), anchor="ma")
    for index, line in enumerate(name_lines):
        draw.text(
            (SIZE / 2, start_y + 34 + index * line_height),
            line,
            font=name_font,
            fill=_hex("#0f172a"),
            anchor="ma",
        )


def build_product_image(
    *,
    product_name: str,
    brand_slug: str,
    brand_name: str,
    category_slug: str,
    product_slug: str,
) -> bytes:
    if category_slug not in CATEGORY_DRAWERS:
        raise ValueError(f"Unsupported category: {category_slug}")

    image = _background()
    draw = ImageDraw.Draw(image)
    _draw_product_shape(image, draw, category_slug, brand_slug, product_slug)
    _draw_label(image, brand_name, product_name)

    buffer = BytesIO()
    image.convert("RGB").save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()
