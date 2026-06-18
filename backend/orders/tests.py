from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from orders.models import Voucher
from orders.views import VoucherValidateView

from orders.services.shipping import (
    FREE_SHIPPING_THRESHOLD,
    METRO_SHIPPING_FEE,
    STANDARD_SHIPPING_FEE,
    calculate_shipping_fee,
)


class ShippingFeeTests(SimpleTestCase):
    def test_free_shipping_above_threshold(self):
        fee = calculate_shipping_fee(FREE_SHIPPING_THRESHOLD, "Hà Nội")
        self.assertEqual(fee, Decimal("0"))

    def test_metro_city_fee(self):
        fee = calculate_shipping_fee(Decimal("500000"), "TP. Hồ Chí Minh")
        self.assertEqual(fee, METRO_SHIPPING_FEE)

    def test_regional_city_fee(self):
        fee = calculate_shipping_fee(Decimal("500000"), "Đà Nẵng")
        self.assertEqual(fee, STANDARD_SHIPPING_FEE)


@override_settings(
    VNPAY_TMN_CODE="RN32XZ2G",
    VNPAY_HASH_SECRET="0HWV59MD52UAQDSNOR9GE2FQ05X8NQT7",
    VNPAY_RETURN_URL="http://127.0.0.1:8000/api/payments/vnpay/return/",
    VNPAY_PAYMENT_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    VNPAY_EXPIRE_MINUTES=30,
)
class VNPayHashTests(SimpleTestCase):
    def test_payment_url_hash_is_self_consistent(self):
        from urllib.parse import parse_qs, urlparse

        from orders.services.vnpay import _build_secure_hash, create_payment_url

        class Order:
            id = 42
            total_price = Decimal("100000.00")

        url = create_payment_url(
            order=Order(),
            txn_ref="PZ42260617220000",
            client_ip="127.0.0.1",
        )
        params = {
            key: values[0]
            for key, values in parse_qs(urlparse(url).query).items()
        }
        payload = {
            key: value for key, value in params.items() if key != "vnp_SecureHash"
        }

        self.assertEqual(
            params["vnp_SecureHash"].lower(),
            _build_secure_hash(payload).lower(),
        )

    def test_callback_verification_ignores_secure_hash_type(self):
        from orders.services.vnpay import _build_secure_hash, verify_signature

        callback = {
            "vnp_Amount": "10000000",
            "vnp_ResponseCode": "00",
            "vnp_TxnRef": "PZ42260617220000",
            "vnp_SecureHashType": "SHA512",
        }
        callback["vnp_SecureHash"] = _build_secure_hash(callback)

        ok, message = verify_signature(callback)
        self.assertTrue(ok, message)

    def test_verify_callback_requires_amount_and_success_status(self):
        from orders.services.vnpay import _build_secure_hash, verify_callback

        class Order:
            total_price = Decimal("100000.00")

        callback = {
            "vnp_Amount": "10000000",
            "vnp_ResponseCode": "00",
            "vnp_TransactionStatus": "00",
            "vnp_TxnRef": "42260617220000",
            "vnp_SecureHashType": "SHA512",
        }
        callback["vnp_SecureHash"] = _build_secure_hash(callback)

        ok, message = verify_callback(Order(), callback)
        self.assertTrue(ok, message)

        wrong_amount = {**callback, "vnp_Amount": "1"}
        wrong_amount["vnp_SecureHash"] = _build_secure_hash(wrong_amount)
        ok, message = verify_callback(Order(), wrong_amount)
        self.assertFalse(ok)
        self.assertIn("không khớp", message)

        failed_status = {**callback, "vnp_ResponseCode": "24"}
        failed_status["vnp_SecureHash"] = _build_secure_hash(failed_status)
        ok, message = verify_callback(Order(), failed_status)
        self.assertFalse(ok)


class VoucherValidateApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="voucher-user",
            password="testpass123",
        )
        now = timezone.now()
        Voucher.objects.create(
            code="PITCH10",
            description="Giảm 10%",
            discount_type=Voucher.DISCOUNT_PERCENT,
            discount_value=Decimal("10"),
            min_order_amount=Decimal("500000"),
            max_discount_amount=Decimal("200000"),
            starts_at=now,
            ends_at=now + timezone.timedelta(days=30),
            is_active=True,
        )
        self.factory = APIRequestFactory()

    def _post_validate(self, payload):
        request = self.factory.post("/api/vouchers/validate/", payload, format="json")
        force_authenticate(request, user=self.user)
        return VoucherValidateView.as_view()(request)

    def test_validate_success(self):
        response = self._post_validate({"code": "pitch10", "subtotal": "600000"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["code"], "PITCH10")
        self.assertEqual(response.data["discount_amount"], Decimal("60000"))

    def test_validate_min_order_error_is_readable(self):
        response = self._post_validate({"code": "PITCH10", "subtotal": "100000"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("voucher_code", response.data)
        message = response.data["voucher_code"]
        if isinstance(message, list):
            message = message[0]
        self.assertIn("500.000", str(message))