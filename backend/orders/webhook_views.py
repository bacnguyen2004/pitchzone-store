import logging

from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .services.carriers import ghn

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class GHNWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data if isinstance(request.data, dict) else {}
        order_code = (
            payload.get("OrderCode")
            or payload.get("order_code")
            or payload.get("orderCode")
        )
        status = payload.get("Status") or payload.get("status") or ""

        if not order_code:
            return Response({"message": "missing order code"}, status=400)

        order = Order.objects.filter(carrier_order_code=str(order_code)).first()
        if not order:
            order = Order.objects.filter(tracking_code=str(order_code)).first()

        if not order:
            logger.info("GHN webhook: order not found for %s", order_code)
            return Response({"message": "order not found"}, status=404)

        mapped_status = ghn.map_carrier_status(status)
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            order.carrier_status = status or order.carrier_status
            update_fields = ["carrier_status"]
            if mapped_status and order.status != mapped_status:
                order.status = mapped_status
                update_fields.append("status")
            order.save(update_fields=update_fields)

        return Response({"message": "ok"})