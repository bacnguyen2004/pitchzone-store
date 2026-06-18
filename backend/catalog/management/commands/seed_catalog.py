from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from catalog.models import Brand, Category, Product, ProductImage, ProductVariant
from catalog.services.product_image_fetch import fetch_product_image_bytes


class Command(BaseCommand):
    help = "Seed football catalog categories, brands, products, variants, and images."

    CATEGORIES = [
        {"name": "Giày bóng đá", "slug": "football-boots"},
        {"name": "Quần áo", "slug": "clothing"},
        {"name": "Phụ kiện", "slug": "accessories"},
    ]

    BRANDS = [
        {"name": "Nike", "slug": "nike"},
        {"name": "Adidas", "slug": "adidas"},
        {"name": "Puma", "slug": "puma"},
    ]

    PRODUCTS = [
        # Giày bóng đá - Nike
        {
            "name": "Giày Nike Mercurial Vapor 16 Academy",
            "slug": "giay-nike-mercurial-vapor-16-academy",
            "category": "football-boots",
            "brand": "nike",
            "price": "2490000",
            "stock": 18,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày tốc độ nhẹ, phù hợp cầu thủ chạy cánh và tiền đạo.",
        },
        {
            "name": "Giày Nike Phantom GX Academy",
            "slug": "giay-nike-phantom-gx-academy",
            "category": "football-boots",
            "brand": "nike",
            "price": "2390000",
            "stock": 16,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày hỗ trợ kiểm soát bóng, chuyền bóng và dứt điểm.",
        },
        {
            "name": "Giày Nike Tiempo Legend 10 Academy",
            "slug": "giay-nike-tiempo-legend-10-academy",
            "category": "football-boots",
            "brand": "nike",
            "price": "2290000",
            "stock": 14,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày form êm, cảm giác bóng tốt, phù hợp nhiều vị trí.",
        },
        {
            "name": "Giày Nike Zoom Superfly 10 Academy",
            "slug": "giay-nike-zoom-superfly-10-academy",
            "category": "football-boots",
            "brand": "nike",
            "price": "2690000",
            "stock": 13,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày cổ cao, hỗ trợ bứt tốc và đổi hướng nhanh.",
        },
        {
            "name": "Giày Nike Premier 3 TF",
            "slug": "giay-nike-premier-3-tf",
            "category": "football-boots",
            "brand": "nike",
            "price": "1890000",
            "stock": 20,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày sân cỏ nhân tạo mini, êm chân và bền khi đá phủi.",
        },
        # Giày bóng đá - Adidas
        {
            "name": "Giày Adidas Predator League FG",
            "slug": "giay-adidas-predator-league-fg",
            "category": "football-boots",
            "brand": "adidas",
            "price": "2290000",
            "stock": 18,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày hỗ trợ kiểm soát bóng và dứt điểm chính xác.",
        },
        {
            "name": "Giày Adidas X Crazyfast League",
            "slug": "giay-adidas-x-crazyfast-league",
            "category": "football-boots",
            "brand": "adidas",
            "price": "2190000",
            "stock": 17,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày tốc độ nhẹ, phù hợp lối chơi bứt phá.",
        },
        {
            "name": "Giày Adidas Copa Pure 2 League",
            "slug": "giay-adidas-copa-pure-2-league",
            "category": "football-boots",
            "brand": "adidas",
            "price": "2090000",
            "stock": 15,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày cảm giác bóng mềm, phù hợp kiểm soát và chuyền bóng.",
        },
        {
            "name": "Giày Adidas F50 League",
            "slug": "giay-adidas-f50-league",
            "category": "football-boots",
            "brand": "adidas",
            "price": "2390000",
            "stock": 16,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày thiên về tốc độ, thiết kế nhẹ và ôm chân.",
        },
        {
            "name": "Giày Adidas Mundial Team TF",
            "slug": "giay-adidas-mundial-team-tf",
            "category": "football-boots",
            "brand": "adidas",
            "price": "2590000",
            "stock": 10,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày turf cổ điển, bền và êm cho sân cỏ nhân tạo.",
        },
        # Giày bóng đá - Puma
        {
            "name": "Giày Puma Future 7 Match FG",
            "slug": "giay-puma-future-7-match-fg",
            "category": "football-boots",
            "brand": "puma",
            "price": "1990000",
            "stock": 18,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày linh hoạt cho lối chơi sáng tạo và rê bóng.",
        },
        {
            "name": "Giày Puma Ultra 5 Match",
            "slug": "giay-puma-ultra-5-match",
            "category": "football-boots",
            "brand": "puma",
            "price": "1890000",
            "stock": 19,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày tốc độ nhẹ, phù hợp cầu thủ chạy biên.",
        },
        {
            "name": "Giày Puma King Match",
            "slug": "giay-puma-king-match",
            "category": "football-boots",
            "brand": "puma",
            "price": "1790000",
            "stock": 14,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày form cổ điển, cảm giác bóng ổn định.",
        },
        {
            "name": "Giày Puma Attacanto Turf",
            "slug": "giay-puma-attacanto-turf",
            "category": "football-boots",
            "brand": "puma",
            "price": "1390000",
            "stock": 22,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày sân cỏ nhân tạo giá tốt, phù hợp đá phong trào.",
        },
        {
            "name": "Giày Puma Future Play TT",
            "slug": "giay-puma-future-play-tt",
            "category": "football-boots",
            "brand": "puma",
            "price": "1590000",
            "stock": 21,
            "sizes": ["39", "40", "41", "42", "43"],
            "description": "Giày turf linh hoạt, bám sân tốt và dễ làm quen.",
        },
        # Quần áo - Áo Ngoại hạng Anh
        {
            "name": "Áo Arsenal sân nhà",
            "slug": "ao-arsenal-san-nha",
            "category": "clothing",
            "brand": "adidas",
            "price": "1190000",
            "stock": 24,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Arsenal sân nhà, màu đỏ trắng đặc trưng, form thể thao.",
        },
        {
            "name": "Áo Manchester United sân nhà",
            "slug": "ao-manchester-united-san-nha",
            "category": "clothing",
            "brand": "adidas",
            "price": "1190000",
            "stock": 25,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Manchester United sân nhà, chất vải thoáng nhẹ.",
        },
        {
            "name": "Áo Liverpool sân nhà",
            "slug": "ao-liverpool-san-nha",
            "category": "clothing",
            "brand": "nike",
            "price": "1190000",
            "stock": 22,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Liverpool sân nhà, màu đỏ nổi bật, phù hợp mặc sân và casual.",
        },
        {
            "name": "Áo Manchester City sân nhà",
            "slug": "ao-manchester-city-san-nha",
            "category": "clothing",
            "brand": "puma",
            "price": "1190000",
            "stock": 20,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Manchester City sân nhà, màu xanh nhạt đặc trưng.",
        },
        {
            "name": "Áo Tottenham sân nhà",
            "slug": "ao-tottenham-san-nha",
            "category": "clothing",
            "brand": "nike",
            "price": "1090000",
            "stock": 18,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Tottenham sân nhà, thiết kế trắng tối giản và dễ mặc.",
        },
        # Quần áo - CLB / đội tuyển khác
        {
            "name": "Áo Real Madrid sân nhà",
            "slug": "ao-real-madrid-san-nha",
            "category": "clothing",
            "brand": "adidas",
            "price": "1290000",
            "stock": 23,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Real Madrid màu trắng cổ điển, form thể thao.",
        },
        {
            "name": "Áo Barcelona sân nhà",
            "slug": "ao-barcelona-san-nha",
            "category": "clothing",
            "brand": "nike",
            "price": "1250000",
            "stock": 21,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Barcelona xanh đỏ đặc trưng, nhẹ và thoáng khi vận động.",
        },
        {
            "name": "Áo đội tuyển Argentina",
            "slug": "ao-doi-tuyen-argentina",
            "category": "clothing",
            "brand": "adidas",
            "price": "1190000",
            "stock": 19,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo Argentina sọc xanh trắng cổ điển, phù hợp cổ vũ và tập luyện.",
        },
        {
            "name": "Áo đội tuyển Pháp",
            "slug": "ao-doi-tuyen-phap",
            "category": "clothing",
            "brand": "nike",
            "price": "1190000",
            "stock": 18,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo đội tuyển Pháp màu xanh đậm, thiết kế khỏe khoắn.",
        },
        {
            "name": "Áo đội tuyển Đức",
            "slug": "ao-doi-tuyen-duc",
            "category": "clothing",
            "brand": "adidas",
            "price": "1190000",
            "stock": 17,
            "sizes": ["S", "M", "L", "XL"],
            "description": "Áo đội tuyển Đức màu trắng truyền thống, form gọn.",
        },
        # Quần áo - Quần
        {
            "name": "Quần Nike Dri-FIT bóng đá",
            "slug": "quan-nike-dri-fit-bong-da",
            "category": "clothing",
            "brand": "nike",
            "price": "590000",
            "stock": 30,
            "sizes": ["M", "L", "XL"],
            "description": "Quần short bóng đá co giãn, thấm hút tốt khi tập luyện.",
        },
        {
            "name": "Quần Adidas Tiro League",
            "slug": "quan-adidas-tiro-league",
            "category": "clothing",
            "brand": "adidas",
            "price": "550000",
            "stock": 28,
            "sizes": ["M", "L", "XL"],
            "description": "Quần short Tiro dáng gọn, nhẹ, phù hợp tập luyện và thi đấu.",
        },
        {
            "name": "Quần Puma TeamRISE",
            "slug": "quan-puma-teamrise",
            "category": "clothing",
            "brand": "puma",
            "price": "490000",
            "stock": 26,
            "sizes": ["M", "L", "XL"],
            "description": "Quần short Puma đơn giản, thoải mái khi vận động.",
        },
        # Phụ kiện - Bóng UCL / World Cup
        {
            "name": "Bóng Adidas UCL League",
            "slug": "bong-adidas-ucl-league",
            "category": "accessories",
            "brand": "adidas",
            "price": "890000",
            "stock": 20,
            "sizes": ["5"],
            "description": "Bóng UEFA Champions League size 5, phù hợp tập luyện và thi đấu.",
        },
        {
            "name": "Bóng Adidas UCL Club",
            "slug": "bong-adidas-ucl-club",
            "category": "accessories",
            "brand": "adidas",
            "price": "590000",
            "stock": 26,
            "sizes": ["5"],
            "description": "Bóng UCL Club size 5, giá tốt cho tập luyện hằng ngày.",
        },
        {
            "name": "Bóng Adidas World Cup 2026 League",
            "slug": "bong-adidas-world-cup-2026-league",
            "category": "accessories",
            "brand": "adidas",
            "price": "990000",
            "stock": 18,
            "sizes": ["5"],
            "description": "Bóng phong cách World Cup, độ bền cao, cảm giác sút ổn định.",
        },
        {
            "name": "Bóng Puma Orbita LaLiga",
            "slug": "bong-puma-orbita-laliga",
            "category": "accessories",
            "brand": "puma",
            "price": "790000",
            "stock": 17,
            "sizes": ["5"],
            "description": "Bóng Puma Orbita size 5, phù hợp tập luyện và đá phong trào.",
        },
        # Phụ kiện - Tất Nike / Adidas / Puma
        {
            "name": "Tất Nike Classic Football",
            "slug": "tat-nike-classic-football",
            "category": "accessories",
            "brand": "nike",
            "price": "250000",
            "stock": 40,
            "sizes": ["M", "L"],
            "description": "Tất bóng đá Nike cổ cao, ôm chân và thoáng khí.",
        },
        {
            "name": "Tất Nike Grip Football",
            "slug": "tat-nike-grip-football",
            "category": "accessories",
            "brand": "nike",
            "price": "390000",
            "stock": 34,
            "sizes": ["M", "L"],
            "description": "Tất grip Nike giúp giảm trượt chân trong giày khi tăng tốc.",
        },
        {
            "name": "Tất Adidas Milano",
            "slug": "tat-adidas-milano",
            "category": "accessories",
            "brand": "adidas",
            "price": "230000",
            "stock": 42,
            "sizes": ["M", "L"],
            "description": "Tất Adidas Milano cổ cao, phù hợp tập luyện và thi đấu.",
        },
        {
            "name": "Tất Adidas Grip Cushioned",
            "slug": "tat-adidas-grip-cushioned",
            "category": "accessories",
            "brand": "adidas",
            "price": "360000",
            "stock": 32,
            "sizes": ["M", "L"],
            "description": "Tất Adidas có đệm êm và độ bám tốt trong giày.",
        },
        {
            "name": "Tất Puma Team Football",
            "slug": "tat-puma-team-football",
            "category": "accessories",
            "brand": "puma",
            "price": "220000",
            "stock": 44,
            "sizes": ["M", "L"],
            "description": "Tất Puma Team cổ cao, ôm chân, phù hợp đá bóng thường xuyên.",
        },
        {
            "name": "Tất Puma Grip Match",
            "slug": "tat-puma-grip-match",
            "category": "accessories",
            "brand": "puma",
            "price": "340000",
            "stock": 30,
            "sizes": ["M", "L"],
            "description": "Tất grip Puma hỗ trợ bám chân tốt hơn trong các pha đổi hướng.",
        },
        # Phụ kiện - Bảo vệ và túi
        {
            "name": "Ống đồng Nike Mercurial Lite",
            "slug": "ong-dong-nike-mercurial-lite",
            "category": "accessories",
            "brand": "nike",
            "price": "450000",
            "stock": 22,
            "sizes": ["One Size"],
            "description": "Ống đồng nhẹ, ôm chân tốt, bảo vệ khi tranh chấp.",
        },
        {
            "name": "Túi đựng giày Adidas Tiro",
            "slug": "tui-dung-giay-adidas-tiro",
            "category": "accessories",
            "brand": "adidas",
            "price": "490000",
            "stock": 18,
            "sizes": ["One Size"],
            "description": "Túi đựng giày nhỏ gọn, tiện mang theo khi đi đá bóng.",
        },
    ]

    OLD_DEMO_PRODUCT_SLUGS = [
        "macbook-air-m2-13-inch",
        "dell-xps-13-plus",
        "asus-rog-zephyrus-g14",
        "keychron-k2-wireless-keyboard",
        "keychron-k6-rgb-hot-swappable",
        "logitech-mx-keys-mini",
        "logitech-mx-master-3s",
        "logitech-g-pro-x-superlight",
        "asus-rog-harpe-ace",
        "sony-wh-1000xm5",
        "sony-wf-1000xm5",
        "logitech-g-pro-x-headset",
        "anker-735-ganprime-65w",
        "anker-737-power-bank",
        "apple-usb-c-power-adapter-70w",
        "tomtoc-navigator-t66-backpack",
        "tomtoc-defender-a42-laptop-sleeve",
        "dell-ecoloop-pro-backpack",
        "nike-mercurial-vapor-16-academy",
        "adidas-predator-league-fg",
        "puma-future-7-match-fg",
        "mizuno-morelia-neo-club",
        "joma-top-flex-turf",
        "manchester-united-home-jersey",
        "real-madrid-home-jersey",
        "barcelona-home-jersey",
        "argentina-home-jersey",
        "vietnam-national-team-jersey",
        "nike-dri-fit-football-shorts",
        "adidas-tiro-league-shorts",
        "puma-team-football-socks",
        "nike-grip-football-socks",
        "adidas-ucl-league-ball",
        "nike-academy-football",
        "adidas-tiro-shin-guards",
        "nike-academy-boot-bag",
    ]

    def handle(self, *args, **options):
        deactivated_count = self.deactivate_previous_demo_products()
        categories = self.seed_categories()
        brands = self.seed_brands()
        products = self.seed_products(categories, brands)
        variant_count = self.seed_variants(products)
        image_count = self.seed_images(products)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed completed: {len(categories)} categories, "
                f"{len(brands)} brands, {len(products)} football products, "
                f"{variant_count} variants, {image_count} new images, "
                f"{deactivated_count} old products deactivated."
            )
        )

    def deactivate_previous_demo_products(self):
        return Product.objects.filter(
            slug__in=self.OLD_DEMO_PRODUCT_SLUGS,
            is_active=True,
        ).update(is_active=False)

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
                    "base_price": Decimal(item["price"]),
                    "is_active": True,
                },
            )
            products.append(product)
        return products

    def seed_variants(self, products):
        total_variants = 0
        product_by_slug = {product.slug: product for product in products}

        for item in self.PRODUCTS:
            product = product_by_slug[item["slug"]]
            sizes = item["sizes"]
            base_stock = item["stock"] // len(sizes)
            extra_stock = item["stock"] % len(sizes)
            expected_skus = []

            for index, size in enumerate(sizes):
                sku = self.build_sku(product.slug, size)
                expected_skus.append(sku)
                stock = base_stock + (1 if index < extra_stock else 0)
                ProductVariant.objects.update_or_create(
                    sku=sku,
                    defaults={
                        "product": product,
                        "size": size,
                        "color": "",
                        "price": Decimal(item["price"]),
                        "stock": stock,
                        "is_active": True,
                    },
                )
                total_variants += 1

            ProductVariant.objects.filter(product=product).exclude(
                sku__in=expected_skus
            ).update(is_active=False)

        return total_variants

    def build_sku(self, product_slug, size):
        size_slug = slugify(size) or "default"
        return f"{product_slug}-{size_slug}"[:80]

    def seed_images(self, products):
        created = 0
        for product in products:
            if product.images.exists():
                continue

            fetched = fetch_product_image_bytes(product)
            if not fetched:
                self.stdout.write(
                    self.style.WARNING(f"Skip image for {product.slug} (Pexels failed).")
                )
                continue

            image_bytes, _source_url = fetched
            ProductImage.objects.create(
                product=product,
                image=ContentFile(image_bytes, name=f"{product.slug}.jpg"),
                alt_text=product.name,
                is_main=True,
            )
            created += 1
        return created
