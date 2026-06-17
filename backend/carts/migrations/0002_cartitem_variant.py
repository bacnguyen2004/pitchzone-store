import django.db.models.deletion
from django.db import migrations, models


def assign_cart_item_variants(apps, schema_editor):
    CartItem = apps.get_model("carts", "CartItem")
    ProductVariant = apps.get_model("catalog", "ProductVariant")

    for item in CartItem.objects.all():
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
            item.save(update_fields=["variant"])


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0003_productvariant_base_price"),
        ("carts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="cartitem",
            name="variant",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="cart_items",
                to="catalog.productvariant",
            ),
        ),
        migrations.RunPython(assign_cart_item_variants, migrations.RunPython.noop),
        migrations.AlterUniqueTogether(
            name="cartitem",
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name="cartitem",
            name="product",
        ),
        migrations.AlterField(
            model_name="cartitem",
            name="variant",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="cart_items",
                to="catalog.productvariant",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="cartitem",
            unique_together={("cart", "variant")},
        ),
    ]
