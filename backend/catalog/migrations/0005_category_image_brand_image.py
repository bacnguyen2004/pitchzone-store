from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0004_promotion_productvariant_compare_at_price_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="categories/"),
        ),
        migrations.AddField(
            model_name="brand",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="brands/"),
        ),
    ]