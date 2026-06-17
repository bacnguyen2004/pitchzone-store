from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_create_existing_customer_profiles"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="customerprofile",
            name="gender",
        ),
        migrations.RenameField(
            model_name="address",
            old_name="province",
            new_name="city",
        ),
        migrations.RemoveField(
            model_name="address",
            name="district",
        ),
        migrations.RenameField(
            model_name="address",
            old_name="street",
            new_name="street_name",
        ),
        migrations.AddField(
            model_name="address",
            name="house_number",
            field=models.CharField(default="", max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="address",
            name="street_name",
            field=models.CharField(max_length=150),
        ),
    ]
