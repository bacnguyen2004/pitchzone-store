from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0003_voucher_order_discount_amount_order_subtotal_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="city",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="order",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("cod", "Thanh toán khi nhận hàng"),
                    ("transfer", "Chuyển khoản ngân hàng"),
                ],
                default="cod",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="shipping_fee",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]