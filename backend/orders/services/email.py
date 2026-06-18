from django.conf import settings
from django.core.mail import send_mail


def send_order_confirmation(order) -> None:
    user = order.user
    recipient = user.email
    if not recipient:
        return

    items = list(order.items.all())
    lines = [
        f"Xin chào {order.full_name},",
        "",
        f"Cảm ơn bạn đã đặt hàng tại PitchZone. Mã đơn: #{order.id}",
        "",
        "Sản phẩm:",
    ]

    for item in items:
        variant = f" ({item.variant_name})" if item.variant_name else ""
        lines.append(
            f"- {item.quantity} x {item.product_name}{variant}: "
            f"{int(item.total_price):,}đ"
        )

    lines.extend(
        [
            "",
            f"Tạm tính: {int(order.subtotal):,}đ",
            f"Phí ship: {int(order.shipping_fee):,}đ",
        ]
    )

    if order.discount_amount:
        lines.append(f"Giảm giá ({order.voucher_code}): -{int(order.discount_amount):,}đ")

    lines.extend(
        [
            f"Tổng thanh toán: {int(order.total_price):,}đ",
            f"Hình thức: {order.get_payment_method_display()}",
        ]
    )

    if order.payment_method == order.PAYMENT_VNPAY:
        if order.payment_status == order.PAYMENT_PAID:
            lines.append("Thanh toán VNPay: Đã xác nhận.")
        else:
            lines.append("Thanh toán VNPay: Chưa hoàn tất.")

    lines.extend(
        [
            "",
            f"Giao tới: {order.address}",
            f"SĐT: {order.phone}",
            "",
            "Theo dõi đơn tại tài khoản PitchZone của bạn.",
        ]
    )

    send_mail(
        subject=f"[PitchZone] Xác nhận đơn hàng #{order.id}",
        message="\n".join(lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=True,
    )