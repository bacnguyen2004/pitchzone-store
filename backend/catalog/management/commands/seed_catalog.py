from decimal import Decimal
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from catalog.models import Brand, Category, Product, ProductImage


class Command(BaseCommand):
    help = "Seed sample categories, brands, products, and placeholder images."

    CATEGORIES = [
        {"name": "Laptop", "slug": "laptop"},
        {"name": "Keyboard", "slug": "keyboard"},
        {"name": "Mouse", "slug": "mouse"},
        {"name": "Headphone", "slug": "headphone"},
        {"name": "Charger", "slug": "charger"},
        {"name": "Backpack", "slug": "backpack"},
    ]

    BRANDS = [
        {"name": "Apple", "slug": "apple"},
        {"name": "Dell", "slug": "dell"},
        {"name": "Asus", "slug": "asus"},
        {"name": "Logitech", "slug": "logitech"},
        {"name": "Keychron", "slug": "keychron"},
        {"name": "Sony", "slug": "sony"},
        {"name": "Anker", "slug": "anker"},
        {"name": "Tomtoc", "slug": "tomtoc"},
    ]

    PRODUCTS = [
        {
            "name": "MacBook Air M2 13 inch",
            "slug": "macbook-air-m2-13-inch",
            "category": "laptop",
            "brand": "apple",
            "price": "24990000",
            "stock": 12,
            "description": "Laptop mong nhe, chip Apple M2, phu hop hoc tap va lam viec hang ngay.",
        },
        {
            "name": "Dell XPS 13 Plus",
            "slug": "dell-xps-13-plus",
            "category": "laptop",
            "brand": "dell",
            "price": "32990000",
            "stock": 8,
            "description": "Ultrabook cao cap voi man hinh sac net, thiet ke mong va hieu nang on dinh.",
        },
        {
            "name": "Asus ROG Zephyrus G14",
            "slug": "asus-rog-zephyrus-g14",
            "category": "laptop",
            "brand": "asus",
            "price": "38990000",
            "stock": 5,
            "description": "Laptop gaming nho gon, manh me cho gaming va cong viec sang tao noi dung.",
        },
        {
            "name": "Keychron K2 Wireless Keyboard",
            "slug": "keychron-k2-wireless-keyboard",
            "category": "keyboard",
            "brand": "keychron",
            "price": "2190000",
            "stock": 25,
            "description": "Ban phim co khong day layout gon, phu hop lam viec va lap trinh.",
        },
        {
            "name": "Keychron K6 RGB Hot-swappable",
            "slug": "keychron-k6-rgb-hot-swappable",
            "category": "keyboard",
            "brand": "keychron",
            "price": "2490000",
            "stock": 18,
            "description": "Ban phim co 65%, ho tro thay switch, co RGB va ket noi Bluetooth.",
        },
        {
            "name": "Logitech MX Keys Mini",
            "slug": "logitech-mx-keys-mini",
            "category": "keyboard",
            "brand": "logitech",
            "price": "2390000",
            "stock": 20,
            "description": "Ban phim van phong cao cap, go em, ket noi nhieu thiet bi.",
        },
        {
            "name": "Logitech MX Master 3S",
            "slug": "logitech-mx-master-3s",
            "category": "mouse",
            "brand": "logitech",
            "price": "2390000",
            "stock": 30,
            "description": "Chuot lam viec cao cap, cuon sieu nhanh, cam bien chinh xac.",
        },
        {
            "name": "Logitech G Pro X Superlight",
            "slug": "logitech-g-pro-x-superlight",
            "category": "mouse",
            "brand": "logitech",
            "price": "2890000",
            "stock": 14,
            "description": "Chuot gaming sieu nhe, thiet ke toi gian, do tre thap.",
        },
        {
            "name": "Asus ROG Harpe Ace",
            "slug": "asus-rog-harpe-ace",
            "category": "mouse",
            "brand": "asus",
            "price": "2690000",
            "stock": 10,
            "description": "Chuot gaming khong day nhe, phu hop FPS va eSports.",
        },
        {
            "name": "Sony WH-1000XM5",
            "slug": "sony-wh-1000xm5",
            "category": "headphone",
            "brand": "sony",
            "price": "7990000",
            "stock": 9,
            "description": "Tai nghe chong on cao cap, chat am tot, pin lau.",
        },
        {
            "name": "Sony WF-1000XM5",
            "slug": "sony-wf-1000xm5",
            "category": "headphone",
            "brand": "sony",
            "price": "5990000",
            "stock": 16,
            "description": "Tai nghe true wireless nho gon, chong on tot va am thanh chi tiet.",
        },
        {
            "name": "Logitech G Pro X Headset",
            "slug": "logitech-g-pro-x-headset",
            "category": "headphone",
            "brand": "logitech",
            "price": "2490000",
            "stock": 11,
            "description": "Tai nghe gaming co mic ro, phu hop cho game va hop online.",
        },
        {
            "name": "Anker 735 GaNPrime 65W",
            "slug": "anker-735-ganprime-65w",
            "category": "charger",
            "brand": "anker",
            "price": "1490000",
            "stock": 35,
            "description": "Cu sac nhanh 65W, cong nghe GaN, sac duoc laptop va dien thoai.",
        },
        {
            "name": "Anker 737 Power Bank",
            "slug": "anker-737-power-bank",
            "category": "charger",
            "brand": "anker",
            "price": "3290000",
            "stock": 13,
            "description": "Pin sac du phong cong suat cao, phu hop di hoc, di lam va di chuyen.",
        },
        {
            "name": "Apple USB-C Power Adapter 70W",
            "slug": "apple-usb-c-power-adapter-70w",
            "category": "charger",
            "brand": "apple",
            "price": "1690000",
            "stock": 22,
            "description": "Cu sac USB-C 70W cho MacBook Air, MacBook Pro va cac thiet bi USB-C.",
        },
        {
            "name": "Tomtoc Navigator-T66 Backpack",
            "slug": "tomtoc-navigator-t66-backpack",
            "category": "backpack",
            "brand": "tomtoc",
            "price": "1890000",
            "stock": 17,
            "description": "Balo laptop chong soc, nhieu ngan, phu hop di hoc va di lam.",
        },
        {
            "name": "Tomtoc Defender-A42 Laptop Sleeve",
            "slug": "tomtoc-defender-a42-laptop-sleeve",
            "category": "backpack",
            "brand": "tomtoc",
            "price": "890000",
            "stock": 28,
            "description": "Tui chong soc laptop gon nhe, bao ve tot khi di chuyen.",
        },
        {
            "name": "Dell EcoLoop Pro Backpack",
            "slug": "dell-ecoloop-pro-backpack",
            "category": "backpack",
            "brand": "dell",
            "price": "1290000",
            "stock": 19,
            "description": "Balo laptop thiet ke gon, chat lieu ben, phu hop moi ngay.",
        },
    ]

    COLORS = [
        "#2563eb",
        "#16a34a",
        "#dc2626",
        "#9333ea",
        "#ea580c",
        "#0f766e",
    ]

    def handle(self, *args, **options):
        categories = self.seed_categories()
        brands = self.seed_brands()
        products = self.seed_products(categories, brands)
        image_count = self.seed_images(products)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed completed: {len(categories)} categories, "
                f"{len(brands)} brands, {len(products)} products, "
                f"{image_count} new images."
            )
        )

    def seed_categories(self):
        categories = {}
        for item in self.CATEGORIES:
            category, _ = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={"name": item["name"]},
            )
            categories[item["slug"]] = category
        return categories

    def seed_brands(self):
        brands = {}
        for item in self.BRANDS:
            brand, _ = Brand.objects.update_or_create(
                slug=item["slug"],
                defaults={"name": item["name"]},
            )
            brands[item["slug"]] = brand
        return brands

    def seed_products(self, categories, brands):
        products = []
        for item in self.PRODUCTS:
            product, _ = Product.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "category": categories[item["category"]],
                    "brand": brands[item["brand"]],
                    "description": item["description"],
                    "price": Decimal(item["price"]),
                    "stock": item["stock"],
                    "is_active": True,
                },
            )
            products.append(product)
        return products

    def seed_images(self, products):
        created = 0
        for index, product in enumerate(products):
            if product.images.exists():
                continue

            image_file = self.build_placeholder_image(
                title=product.name,
                color=self.COLORS[index % len(self.COLORS)],
            )
            ProductImage.objects.create(
                product=product,
                image=image_file,
                alt_text=product.name,
                is_main=True,
            )
            created += 1
        return created

    def build_placeholder_image(self, title, color):
        try:
            from PIL import Image, ImageDraw, ImageFont
        except ImportError as exc:
            raise RuntimeError("Please install Pillow before seeding images.") from exc

        width, height = 900, 600
        image = Image.new("RGB", (width, height), color)
        draw = ImageDraw.Draw(image)

        font = ImageFont.load_default()
        text = self.wrap_text(title, max_length=26)
        bbox = draw.multiline_textbbox((0, 0), text, font=font, spacing=10)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((width - text_width) / 2, (height - text_height) / 2)

        draw.multiline_text(
            position,
            text,
            fill="white",
            font=font,
            spacing=10,
            align="center",
        )

        buffer = BytesIO()
        image.save(buffer, format="PNG")
        filename = f"{title.lower().replace(' ', '-')}.png"
        return ContentFile(buffer.getvalue(), name=filename)

    def wrap_text(self, text, max_length):
        words = text.split()
        lines = []
        current_line = []

        for word in words:
            candidate = " ".join(current_line + [word])
            if len(candidate) > max_length and current_line:
                lines.append(" ".join(current_line))
                current_line = [word]
            else:
                current_line.append(word)

        if current_line:
            lines.append(" ".join(current_line))

        return "\n".join(lines)
