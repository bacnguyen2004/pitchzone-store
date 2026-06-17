from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from catalog.models import Product, ProductVariant, Promotion, PromotionProduct
from orders.models import Voucher


class Command(BaseCommand):
    help = "Seed flash deals, product sale prices, and vouchers."

    DEAL_PRODUCTS = [
        ("giay-nike-mercurial-vapor-16-academy", 30),
        ("giay-adidas-predator-league-fg", 25),
        ("ao-manchester-united-san-nha", 20),
        ("bong-adidas-ucl-league", 15),
    ]

    SALE_PRODUCTS = [
        ("giay-nike-phantom-gx-academy", Decimal("0.85")),
        ("giay-puma-future-7-play-fg", Decimal("0.80")),
        ("quan-nike-park-short", Decimal("0.75")),
        ("tat-nike-park-crew", Decimal("0.70")),
    ]

    VOUCHERS = [
        {
            "code": "PITCH10",
            "description": "Giảm 10% tối đa 200K cho đơn từ 500K",
            "discount_type": Voucher.DISCOUNT_PERCENT,
            "discount_value": Decimal("10"),
            "min_order_amount": Decimal("500000"),
            "max_discount_amount": Decimal("200000"),
        },
        {
            "code": "DEAL50K",
            "description": "Giảm 50K cho đơn từ 1 triệu",
            "discount_type": Voucher.DISCOUNT_FIXED,
            "discount_value": Decimal("50000"),
            "min_order_amount": Decimal("1000000"),
            "max_discount_amount": None,
        },
        {
            "code": "WELCOME15",
            "description": "Giảm 15% cho khách mới — đơn từ 300K",
            "discount_type": Voucher.DISCOUNT_PERCENT,
            "discount_value": Decimal("15"),
            "min_order_amount": Decimal("300000"),
            "max_discount_amount": Decimal("350000"),
        },
    ]

    def handle(self, *args, **options):
        now = timezone.now()
        ends_at = now + timedelta(days=7)

        promotion, created = Promotion.objects.update_or_create(
            slug="deal-soc-cuoi-tuan",
            defaults={
                "name": "Deal sốc cuối tuần",
                "eyebrow": "Flash sale",
                "title": "Deal sốc cuối tuần",
                "description": "Giảm giá có hạn — chốt nhanh trước khi hết giờ.",
                "discount_type": Promotion.DISCOUNT_PERCENT,
                "discount_value": Decimal("20"),
                "starts_at": now,
                "ends_at": ends_at,
                "is_active": True,
                "perks": [
                    "Freeship đơn từ 500K",
                    "Đổi size miễn phí 7 ngày",
                ],
            },
        )

        promotion.promotion_products.all().delete()

        for slug, discount_percent in self.DEAL_PRODUCTS:
            product = Product.objects.filter(slug=slug).first()
            if not product:
                self.stdout.write(self.style.WARNING(f"Skip deal product: {slug}"))
                continue

            PromotionProduct.objects.create(
                promotion=promotion,
                product=product,
                discount_percent=discount_percent,
            )

        for slug, ratio in self.SALE_PRODUCTS:
            product = Product.objects.filter(slug=slug).first()
            if not product:
                self.stdout.write(self.style.WARNING(f"Skip sale product: {slug}"))
                continue

            for variant in product.variants.filter(is_active=True):
                sale_price = (variant.price * ratio).quantize(Decimal("1"))
                variant.sale_price = sale_price
                variant.compare_at_price = variant.price
                variant.save(update_fields=["sale_price", "compare_at_price"])

        for voucher_data in self.VOUCHERS:
            Voucher.objects.update_or_create(
                code=voucher_data["code"],
                defaults={
                    **voucher_data,
                    "starts_at": now,
                    "ends_at": now + timedelta(days=90),
                    "is_active": True,
                    "usage_limit": None,
                },
            )

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} promotion '{promotion.name}' with "
                f"{promotion.promotion_products.count()} deal products."
            )
        )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(self.VOUCHERS)} vouchers."))