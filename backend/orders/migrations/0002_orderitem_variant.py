import django.db.models.deletion
from django.db import migrations, models


def variant_name(variant):
    if variant.color:
        return f"{variant.size} / {variant.color}"
    return variant.size


def assign_order_item_variants(apps, schema_editor):
    OrderItem = apps.get_model("orders", "OrderItem")
    ProductVariant = apps.get_model("catalog", "ProductVariant")

    for item in OrderItem.objects.all():
        variant = ProductVariant.objects.filter(
            product_id=item.product_id,
            is_active=True,
        ).order_by("id").first()
        if not variant:
            variant = ProductVariant.objects.filter(
                product_id=item.product_id,
            ).order_by("id").first()

        if variant:
            item.variant_id = variant.id
            item.variant_name = variant_name(variant)
            item.save(update_fields=["variant", "variant_name"])


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0003_productvariant_base_price"),
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="orderitem",
            name="variant",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="order_items",
                to="catalog.productvariant",
            ),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="variant_name",
            field=models.CharField(blank=True, default="", max_length=100),
            preserve_default=False,
        ),
        migrations.RunPython(assign_order_item_variants, migrations.RunPython.noop),
    ]
