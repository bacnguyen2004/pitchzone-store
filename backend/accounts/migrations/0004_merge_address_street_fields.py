from django.db import migrations, models


def merge_street_fields(apps, schema_editor):
    Address = apps.get_model("accounts", "Address")

    for address in Address.objects.all():
        parts = [address.house_number, address.street_address]
        address.street_address = " ".join(part for part in parts if part).strip()
        address.save(update_fields=["street_address"])


def split_street_fields(apps, schema_editor):
    Address = apps.get_model("accounts", "Address")

    for address in Address.objects.all():
        address.house_number = ""
        address.save(update_fields=["house_number"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_simplify_customer_address"),
    ]

    operations = [
        migrations.RenameField(
            model_name="address",
            old_name="street_name",
            new_name="street_address",
        ),
        migrations.AlterField(
            model_name="address",
            name="street_address",
            field=models.CharField(max_length=255),
        ),
        migrations.RunPython(merge_street_fields, split_street_fields),
        migrations.RemoveField(
            model_name="address",
            name="house_number",
        ),
    ]
