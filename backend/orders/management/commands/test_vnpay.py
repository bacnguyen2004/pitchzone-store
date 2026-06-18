from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

from django.conf import settings
from django.core.management.base import BaseCommand

from orders.services.vnpay import (
    _build_hash_data,
    _build_secure_hash,
    build_txn_ref,
    create_payment_url,
    is_configured,
    verify_signature,
    vietnam_now,
)


class _NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class _MockOrder:
    def __init__(self, order_id: int, total_price):
        self.id = order_id
        self.total_price = total_price


class Command(BaseCommand):
    help = "Kiem tra cau hinh VNPay, chu ky va phan hoi sandbox."

    def handle(self, *args, **options):
        self.stdout.write("=== VNPay diagnostic ===")

        configured = is_configured()
        self.stdout.write(f"Configured: {configured}")
        self.stdout.write(f"TmnCode: {settings.VNPAY_TMN_CODE or '(empty)'}")
        self.stdout.write(
            f"Hash secret length: {len(settings.VNPAY_HASH_SECRET or '')}"
        )
        self.stdout.write(f"Return URL: {settings.VNPAY_RETURN_URL}")
        self.stdout.write(f"Payment URL: {settings.VNPAY_PAYMENT_URL}")
        self.stdout.write(f"Expire minutes: {settings.VNPAY_EXPIRE_MINUTES}")

        now_vn = vietnam_now()
        self.stdout.write(f"Vietnam time: {now_vn.strftime('%Y-%m-%d %H:%M:%S %Z')}")

        if not configured:
            self.stderr.write(self.style.ERROR("VNPay chua duoc cau hinh day du."))
            return

        order = _MockOrder(999, Decimal("64900.00"))
        txn_ref = build_txn_ref(order.id)
        payment_url = create_payment_url(
            order=order,
            txn_ref=txn_ref,
            client_ip="127.0.0.1",
        )

        parsed = urlparse(payment_url)
        params = {key: values[0] for key, values in parse_qs(parsed.query).items()}
        payload = {key: value for key, value in params.items() if key != "vnp_SecureHash"}
        rebuilt = _build_secure_hash(payload)
        hash_match = params.get("vnp_SecureHash", "").lower() == rebuilt.lower()

        self.stdout.write(f"TxnRef: {txn_ref}")
        self.stdout.write(f"Hash self-check: {'OK' if hash_match else 'FAIL'}")
        self.stdout.write(f"Hash data: {_build_hash_data(payload)[:120]}...")

        try:
            request = Request(payment_url, headers={"User-Agent": "PitchZone VNPay diagnostic"})
            opener = build_opener(_NoRedirectHandler)
            try:
                response = opener.open(request, timeout=20)
            except HTTPError as exc:
                response = exc

            location = response.headers.get("Location", "")
            body = response.read().decode("utf-8", errors="ignore").lower()
            location_lower = location.lower()
            body_lower = body.lower()
            error_codes = []
            for source in (location_lower, body_lower):
                for code in ("97", "70", "99"):
                    if f"code={code}" in source:
                        error_codes.append(code)

            payment_page = "paymentmethod.html" in location_lower
            error_messages = {
                "97": "Sandbox rejected signature (code 97).",
                "70": "Sandbox bao SAI CHU KY (code 70) - kiem tra HashSecret tren merchantv2 hoac email VNPay.",
                "99": "Sandbox rejected request (code 99).",
            }

            self.stdout.write(f"Sandbox HTTP status: {response.status}")
            if location:
                self.stdout.write(f"Redirect: {location[:200]}")
            if error_codes:
                for code in dict.fromkeys(error_codes):
                    self.stdout.write(
                        self.style.ERROR(
                            error_messages.get(code, f"Sandbox error code {code}.")
                        )
                    )
            elif payment_page:
                self.stdout.write(self.style.SUCCESS("Sandbox accepted payment URL."))
            else:
                self.stdout.write(self.style.WARNING("Unexpected sandbox response."))
        except URLError as exc:
            self.stderr.write(self.style.ERROR(f"Sandbox request failed: {exc}"))

        sample_callback = {
            "vnp_Amount": params.get("vnp_Amount", ""),
            "vnp_BankCode": "NCB",
            "vnp_BankTranNo": "VNP14231412",
            "vnp_CardType": "ATM",
            "vnp_OrderInfo": params.get("vnp_OrderInfo", ""),
            "vnp_PayDate": now_vn.strftime("%Y%m%d%H%M%S"),
            "vnp_ResponseCode": "00",
            "vnp_TmnCode": params.get("vnp_TmnCode", ""),
            "vnp_TransactionNo": "14231412",
            "vnp_TxnRef": txn_ref,
            "vnp_SecureHashType": "SHA512",
        }
        sample_callback["vnp_SecureHash"] = _build_secure_hash(sample_callback)
        callback_ok, callback_message = verify_signature(sample_callback)
        self.stdout.write(
            f"Callback verify sample: {'OK' if callback_ok else 'FAIL'} ({callback_message})"
        )

        self.stdout.write("")
        self.stdout.write("Payment URL (open in browser within expire window):")
        self.stdout.write(payment_url)
