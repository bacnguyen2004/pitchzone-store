from django.conf import settings
from django.core.management.base import BaseCommand

from orders.payment_views import release_unpaid_vnpay_orders


class Command(BaseCommand):
    help = "Hủy đơn VNPay chưa thanh toán và trả lại tồn kho."

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="Hủy mọi đơn VNPay unpaid (không chờ hết hạn)",
        )
        parser.add_argument(
            "--minutes",
            type=int,
            default=None,
            help="Chỉ hủy đơn cũ hơn N phút (mặc định: VNPAY_EXPIRE_MINUTES)",
        )

    def handle(self, *args, **options):
        if options["all"]:
            released = release_unpaid_vnpay_orders()
        else:
            minutes = options["minutes"]
            if minutes is None:
                minutes = getattr(settings, "VNPAY_EXPIRE_MINUTES", 15)
            released = release_unpaid_vnpay_orders(older_than_minutes=minutes)

        self.stdout.write(
            self.style.SUCCESS(f"Đã hủy {released} đơn VNPay chưa thanh toán.")
        )