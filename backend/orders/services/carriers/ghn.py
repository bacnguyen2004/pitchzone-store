import json
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

GHN_PROD_URL = "https://online-gateway.ghn.vn/shiip/public-api/v2"
GHN_SANDBOX_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2"


def _base_url() -> str:
    if getattr(settings, "GHN_USE_SANDBOX", False):
        return GHN_SANDBOX_URL
    return GHN_PROD_URL

# Mã quận mặc định khi khách chỉ nhập tên tỉnh/thành
DEFAULT_DISTRICT_BY_CITY = {
    "hồ chí minh": 1442,
    "ho chi minh": 1442,
    "hcm": 1442,
    "sài gòn": 1442,
    "sai gon": 1442,
    "hà nội": 1485,
    "ha noi": 1485,
    "đà nẵng": 1530,
    "da nang": 1530,
}

GHN_STATUS_TO_ORDER = {
    "ready_to_pick": "processing",
    "picking": "processing",
    "storing": "processing",
    "delivering": "shipping",
    "transporting": "shipping",
    "delivery_fail": "shipping",
    "delivered": "completed",
    "return": "cancelled",
    "cancel": "cancelled",
}


def get_from_district_id() -> int | None:
    raw = (settings.GHN_FROM_DISTRICT_ID or "").strip()
    if raw:
        try:
            return int(raw)
        except ValueError:
            pass

    from_city = getattr(settings, "GHN_FROM_CITY", "") or ""
    return resolve_district_id(from_city)


def is_configured() -> bool:
    return bool(
        settings.GHN_TOKEN and settings.GHN_SHOP_ID and get_from_district_id()
    )


def _headers() -> dict:
    return {
        "Token": settings.GHN_TOKEN,
        "ShopId": str(settings.GHN_SHOP_ID),
        "Content-Type": "application/json",
    }


def _request(method: str, path: str, payload: dict | None = None) -> dict:
    url = f"{_base_url()}{path}"
    data = json.dumps(payload or {}).encode("utf-8")
    request = Request(url, data=data, headers=_headers(), method=method)

    try:
        with urlopen(request, timeout=15) as response:
            body = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"GHN request failed: {exc}") from exc

    if body.get("code") != 200:
        message = body.get("message") or body.get("code_message") or "GHN error"
        raise RuntimeError(message)

    return body.get("data") or {}


def resolve_district_id(city: str, district_id: int | None = None) -> int | None:
    if district_id:
        return district_id

    normalized = (city or "").strip().lower()
    for keyword, value in DEFAULT_DISTRICT_BY_CITY.items():
        if keyword in normalized:
            return value
    return None


def get_shipping_fee(
    *,
    to_district_id: int,
    weight_grams: int,
    insurance_value: int = 0,
) -> Decimal:
    payload = {
        "from_district_id": int(get_from_district_id()),
        "to_district_id": int(to_district_id),
        "weight": max(int(weight_grams), 200),
        "length": 20,
        "width": 15,
        "height": 10,
        "insurance_value": max(int(insurance_value), 0),
        "service_type_id": 2,
    }
    data = _request("POST", "/shipping-order/fee", payload)
    total = data.get("total") or data.get("service_fee") or 0
    return Decimal(str(total))


def create_shipment(order) -> dict:
    to_district_id = order.district_id or resolve_district_id(order.city)
    if not to_district_id:
        raise RuntimeError("Thiếu mã quận/huyện GHN cho đơn hàng.")

    weight = order.shipping_weight or 500
    items = []
    for item in order.items.all():
        items.append(
            {
                "name": item.product_name[:255],
                "quantity": item.quantity,
                "weight": max(weight // max(order.items.count(), 1), 200),
            }
        )

    payload = {
        "payment_type_id": 2 if order.payment_method == order.PAYMENT_COD else 1,
        "note": order.note[:255] if order.note else f"PitchZone #{order.id}",
        "required_note": "KHONGCHOXEMHANG",
        "from_name": settings.GHN_FROM_NAME,
        "from_phone": settings.GHN_FROM_PHONE,
        "from_address": settings.GHN_FROM_ADDRESS,
        "from_ward_name": settings.GHN_FROM_WARD,
        "from_district_id": int(get_from_district_id()),
        "to_name": order.full_name,
        "to_phone": order.phone,
        "to_address": order.address,
        "to_ward_code": order.ward_code or "",
        "to_district_id": int(to_district_id),
        "cod_amount": int(order.total_price) if order.payment_method == order.PAYMENT_COD else 0,
        "content": f"Đơn PitchZone #{order.id}",
        "weight": max(int(weight), 200),
        "length": 20,
        "width": 15,
        "height": 10,
        "insurance_value": int(order.subtotal),
        "client_order_code": f"PZ-{order.id}",
        "items": items or [{"name": "Sản phẩm PitchZone", "quantity": 1, "weight": 500}],
    }

    return _request("POST", "/shipping-order/create", payload)


def map_carrier_status(carrier_status: str) -> str | None:
    return GHN_STATUS_TO_ORDER.get((carrier_status or "").strip().lower())