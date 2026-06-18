import hashlib
import hmac
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo

from django.conf import settings
from django.utils import timezone

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
HASH_EXCLUDE = {"vnp_SecureHash", "vnp_SecureHashType"}


def vietnam_now():
    return timezone.now().astimezone(VN_TZ)


def is_configured() -> bool:
    return bool(
        settings.VNPAY_TMN_CODE
        and settings.VNPAY_HASH_SECRET
        and settings.VNPAY_PAYMENT_URL
    )


def _prepare_hash_params(params: dict) -> dict[str, str]:
    cleaned = {}
    for key, value in params.items():
        if key in HASH_EXCLUDE:
            continue
        if value in (None, ""):
            continue
        cleaned[key] = str(value)
    return cleaned


def _build_hash_data(params: dict) -> str:
    sorted_params = sorted(_prepare_hash_params(params).items())
    return "&".join(
        f"{quote_plus(key)}={quote_plus(value)}"
        for key, value in sorted_params
    )


def _build_secure_hash(params: dict) -> str:
    return hmac.new(
        settings.VNPAY_HASH_SECRET.encode("utf-8"),
        _build_hash_data(params).encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()


def build_txn_ref(order_id: int) -> str:
    timestamp = vietnam_now().strftime("%Y%m%d%H%M%S")
    return f"{order_id}{timestamp}"


def vnpay_amount(order) -> str:
    return str(int(order.total_price * 100))


def create_payment_url(*, order, txn_ref: str, client_ip: str) -> str:
    now_vn = vietnam_now()
    create_date = now_vn.strftime("%Y%m%d%H%M%S")
    expire_minutes = getattr(settings, "VNPAY_EXPIRE_MINUTES", 15)
    expire_date = (now_vn + timedelta(minutes=expire_minutes)).strftime("%Y%m%d%H%M%S")

    params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": settings.VNPAY_TMN_CODE,
        "vnp_Amount": vnpay_amount(order),
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,
        "vnp_OrderInfo": f"Thanh toan don hang {order.id}",
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": settings.VNPAY_RETURN_URL,
        "vnp_IpAddr": client_ip or "127.0.0.1",
        "vnp_CreateDate": create_date,
        "vnp_ExpireDate": expire_date,
    }

    query = _build_hash_data(params)
    secure_hash = _build_secure_hash(params)
    return f"{settings.VNPAY_PAYMENT_URL}?{query}&vnp_SecureHash={secure_hash}"


def verify_signature(params: dict) -> tuple[bool, str]:
    secure_hash = params.get("vnp_SecureHash")
    if not secure_hash:
        return False, "Thiếu chữ ký VNPay."

    expected = _build_secure_hash(params)
    if not hmac.compare_digest(expected.lower(), str(secure_hash).lower()):
        return False, "Chữ ký VNPay không hợp lệ."

    return True, "valid"


def validate_callback_amount(order, params: dict) -> tuple[bool, str]:
    vnp_amount = params.get("vnp_Amount")
    if vnp_amount in (None, ""):
        return False, "Thiếu số tiền VNPay."

    try:
        callback_amount = Decimal(str(vnp_amount)) / Decimal("100")
    except (InvalidOperation, TypeError, ValueError):
        return False, "Số tiền thanh toán không hợp lệ."

    if callback_amount != order.total_price:
        return False, "Số tiền thanh toán không khớp."

    return True, "valid"


def verify_callback(order, params: dict) -> tuple[bool, str]:
    ok, message = verify_signature(params)
    if not ok:
        return False, message

    ok, message = validate_callback_amount(order, params)
    if not ok:
        return False, message

    response_code = params.get("vnp_ResponseCode", "")
    transaction_status = params.get("vnp_TransactionStatus", "")

    if response_code != "00" or transaction_status != "00":
        if response_code and response_code != "00":
            return False, f"VNPay từ chối giao dịch ({response_code})."
        if transaction_status and transaction_status != "00":
            return False, f"Giao dịch chưa thành công ({transaction_status})."
        return False, "Thanh toán VNPay thất bại."

    return True, "success"