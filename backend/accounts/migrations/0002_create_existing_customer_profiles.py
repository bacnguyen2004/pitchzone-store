from django.conf import settings
from django.db import migrations


def create_existing_customer_profiles(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL.split(".")[0], settings.AUTH_USER_MODEL.split(".")[1])
    CustomerProfile = apps.get_model("accounts", "CustomerProfile")

    existing_profile_user_ids = CustomerProfile.objects.values_list("user_id", flat=True)
    profiles = [
        CustomerProfile(user_id=user.id)
        for user in User.objects.exclude(id__in=existing_profile_user_ids)
    ]

    CustomerProfile.objects.bulk_create(profiles)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            create_existing_customer_profiles,
            migrations.RunPython.noop,
        ),
    ]
