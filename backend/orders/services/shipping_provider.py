from decimal import Decimal

from .carriers import ghn
from .shipping import FREE_SHIPPING_THRESHOLD, calculate_shipping_fee


def estimate_weight_grams(item_count: int, fallback: int = 500) -> int:
    if item_count <= 0:
        return fallback
    return max(item_count * 300, 300)


def get_shipping_quote(
    *,
    subtotal,
    city: str = "",
    district_id: int | None = None,
    ward_code: str = "",
    weight_grams: int | None = None,
    item_count: int = 1,
) -> dict:
    subtotal = Decimal(subtotal or 0)
    weight = weight_grams or estimate_weight_grams(item_count)
    resolved_district = ghn.resolve_district_id(city, district_id)

    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return {
            "subtotal": subtotal,
            "city": city,
            "district_id": resolved_district,
            "ward_code": ward_code,
            "weight_grams": weight,
            "shipping_fee": Decimal("0"),
            "total_with_shipping": subtotal,
            "provider": "free_shipping",
            "provider_label": "Miễn phí vận chuyển",
        }

    if ghn.is_configured() and resolved_district:
        try:
            fee = ghn.get_shipping_fee(
                to_district_id=resolved_district,
                weight_grams=weight,
                insurance_value=int(subtotal),
            )
            return {
                "subtotal": subtotal,
                "city": city,
                "district_id": resolved_district,
                "ward_code": ward_code,
                "weight_grams": weight,
                "shipping_fee": fee,
                "total_with_shipping": subtotal + fee,
                "provider": "ghn",
                "provider_label": "Giao Hàng Nhanh",
            }
        except RuntimeError:
            pass

    fee = calculate_shipping_fee(subtotal, city)
    return {
        "subtotal": subtotal,
        "city": city,
        "district_id": resolved_district,
        "ward_code": ward_code,
        "weight_grams": weight,
        "shipping_fee": fee,
        "total_with_shipping": subtotal + fee,
        "provider": "local",
        "provider_label": "Ước tính nội bộ",
    }


def create_carrier_shipment(order):
    if not ghn.is_configured():
        return None

    data = ghn.create_shipment(order)
    return {
        "carrier": "ghn",
        "tracking_code": data.get("order_code") or "",
        "carrier_order_code": str(data.get("order_code") or ""),
        "carrier_status": data.get("status") or "ready_to_pick",
    }