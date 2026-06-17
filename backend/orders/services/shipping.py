from decimal import Decimal

FREE_SHIPPING_THRESHOLD = Decimal("2000000")
METRO_SHIPPING_FEE = Decimal("30000")
STANDARD_SHIPPING_FEE = Decimal("50000")

METRO_CITY_KEYWORDS = (
    "hồ chí minh",
    "ho chi minh",
    "hcm",
    "tp.hcm",
    "tp hcm",
    "sài gòn",
    "sai gon",
    "hà nội",
    "ha noi",
    "hn",
)


def normalize_city(city: str) -> str:
    return (city or "").strip().lower()


def is_metro_city(city: str) -> bool:
    normalized = normalize_city(city)
    if not normalized:
        return False
    return any(keyword in normalized for keyword in METRO_CITY_KEYWORDS)


def calculate_shipping_fee(subtotal, city: str = "") -> Decimal:
    subtotal = Decimal(subtotal or 0)
    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return Decimal("0")
    if is_metro_city(city):
        return METRO_SHIPPING_FEE
    return STANDARD_SHIPPING_FEE