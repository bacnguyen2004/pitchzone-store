import django.db.models.deletion
from django.db import migrations, models


def build_sku(product, suffix="one-size"):
    suffix = suffix[:30]
    max_slug_length = 79 - len(suffix)
    return f"{product.slug[:max_slug_length]}-{suffix}"


def create_default_variants(apps, schema_editor):
    Product = apps.get_model("catalog", "Product")
    ProductVariant = apps.get_model("catalog", "ProductVariant")

    for product in Product.objects.all():
        if ProductVariant.objects.filter(product_id=product.id).exists():
            continue

        sku = build_sku(product)
        counter = 2
        while ProductVariant.objects.filter(sku=sku).exists():
            sku = build_sku(product, f"one-size-{counter}")
            counter += 1

        ProductVariant.objects.create(
            product_id=product.id,
            sku=sku,
            size="One Size",
            color="",
            price=product.base_price,
            stock=product.stock,
            is_active=product.is_active,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0002_productimage"),
    ]

    operations = [
        migrations.RenameField(
            model_name="product",
            old_name="price",
            new_name="base_price",
        ),
        migrations.CreateModel(
            name="ProductVariant",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("sku", models.CharField(max_length=80, unique=True)),
                ("size", models.CharField(max_length=30)),
                ("color", models.CharField(blank=True, max_length=50)),
                ("price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("stock", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="variants",
                        to="catalog.product",
                    ),
                ),
            ],
            options={
                "ordering": ("product__name", "size", "color"),
                "unique_together": {("product", "size", "color")},
            },
        ),
        migrations.RunPython(create_default_variants, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="product",
            name="stock",
        ),
    ]
