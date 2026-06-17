from decimal import Decimal

from django.test import SimpleTestCase

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