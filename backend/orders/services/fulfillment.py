import logging

from .shipping_provider import create_carrier_shipment

logger = logging.getLogger(__name__)


def maybe_create_shipment(order):
    if order.tracking_code or order.carrier_order_code:
        return order

    try:
        shipment = create_carrier_shipment(order)
    except RuntimeError as exc:
        logger.warning("Carrier shipment failed for order %s: %s", order.id, exc)
        return order

    if not shipment:
        return order

    order.carrier = shipment["carrier"]
    order.tracking_code = shipment["tracking_code"]
    order.carrier_order_code = shipment["carrier_order_code"]
    order.carrier_status = shipment["carrier_status"]
    order.save(
        update_fields=[
            "carrier",
            "tracking_code",
            "carrier_order_code",
            "carrier_status",
        ]
    )
    return order