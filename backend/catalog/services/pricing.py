from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone

from catalog.models import Promotion, PromotionProduct


def round_price(value):
    return Decimal(value).quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def _is_promotion_active(promotion, at):
    return (
        promotion.is_active
        and promotion.starts_at <= at <= promotion.ends_at
    )


def get_active_promotion_product(product, at=None):
    at = at or timezone.now()
    links = (
        PromotionProduct.objects.filter(
            product=product,
            promotion__is_active=True,
            promotion__starts_at__lte=at,
            promotion__ends_at__gte=at,
        )
        .select_related("promotion")
        .order_by("-promotion__discount_value", "-promotion__starts_at")
    )

    for link in links:
        if _is_promotion_active(link.promotion, at):
            return link

    return None


def _promotion_discount_percent(promotion_link):
    if promotion_link.discount_percent is not None:
        return Decimal(promotion_link.discount_percent)

    promotion = promotion_link.promotion
    if promotion.discount_type == Promotion.DISCOUNT_PERCENT:
        return promotion.discount_value

    return None


def compute_promotion_price(list_price, promotion_link):
    list_price = Decimal(list_price)
    percent = _promotion_discount_percent(promotion_link)

    if percent is not None:
        discount = list_price * percent / Decimal("100")
        return round_price(list_price - discount)

    promotion = promotion_link.promotion
    if promotion.discount_type == Promotion.DISCOUNT_FIXED:
        return max(round_price(list_price - promotion.discount_value), Decimal("0"))

    return list_price


def get_variant_pricing(variant, at=None):
    at = at or timezone.now()
    list_price = Decimal(variant.price)
    compare_at = Decimal(variant.compare_at_price or list_price)

    candidates = [(list_price, None)]

    if variant.sale_price is not None:
        sale_price = Decimal(variant.sale_price)
        if sale_price < list_price:
            candidates.append((sale_price, "sale"))

    promotion_link = get_active_promotion_product(variant.product, at)
    if promotion_link:
        promo_price = compute_promotion_price(list_price, promotion_link)
        if promo_price < list_price:
            candidates.append((promo_price, "promotion"))

    effective_price, source = min(candidates, key=lambda item: item[0])
    is_on_sale = effective_price < list_price
    discount_percent = 0

    if is_on_sale and list_price > 0:
        discount_percent = int(
            round((1 - effective_price / list_price) * 100)
        )

    original = list_price
    if compare_at > list_price:
        original = compare_at

    return {
        "list_price": list_price,
        "compare_at_price": original if original > effective_price else list_price,
        "effective_price": effective_price,
        "is_on_sale": is_on_sale,
        "discount_percent": discount_percent,
        "promotion_id": (
            promotion_link.promotion_id
            if source == "promotion" and promotion_link
            else None
        ),
        "is_deal": source == "promotion",
    }


def get_product_pricing(product, at=None):
    variants = [
        variant
        for variant in product.variants.all()
        if variant.is_active
    ]

    if not variants:
        list_price = Decimal(product.base_price)
        return {
            "list_price": list_price,
            "compare_at_price": list_price,
            "effective_price": list_price,
            "price": list_price,
            "is_on_sale": False,
            "discount_percent": 0,
            "is_deal": False,
            "promotion_id": None,
        }

    priced = [get_variant_pricing(variant, at) for variant in variants]
    best = min(priced, key=lambda item: item["effective_price"])

    return {
        "list_price": best["list_price"],
        "compare_at_price": best["compare_at_price"],
        "effective_price": best["effective_price"],
        "price": best["effective_price"],
        "is_on_sale": best["is_on_sale"],
        "discount_percent": best["discount_percent"],
        "is_deal": best["is_deal"],
        "promotion_id": best["promotion_id"],
    }