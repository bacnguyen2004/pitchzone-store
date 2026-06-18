from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0004_order_payment_method_shipping_fee_city"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("cod", "Thanh toán khi nhận hàng"),
                    ("transfer", "Chuyển khoản ngân hàng"),
                    ("vnpay", "VNPay"),
                ],
                default="cod",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="payment_status",
            field=models.CharField(
                choices=[
                    ("unpaid", "Chưa thanh toán"),
                    ("pending", "Chờ xác nhận"),
                    ("paid", "Đã thanh toán"),
                    ("failed", "Thanh toán thất bại"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="order",
            name="vnpay_txn_ref",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="order",
            name="paid_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="carrier",
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name="order",
            name="tracking_code",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="order",
            name="carrier_order_code",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="order",
            name="carrier_status",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="order",
            name="district_id",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="order",
            name="ward_code",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="order",
            name="shipping_weight",
            field=models.PositiveIntegerField(default=0),
        ),
    ]