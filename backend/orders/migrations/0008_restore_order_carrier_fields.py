from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0007_remove_order_carrier_remove_order_carrier_order_code_and_more"),
    ]

    operations = [
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