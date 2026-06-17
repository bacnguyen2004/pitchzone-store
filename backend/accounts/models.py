from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.user.username


class Address(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    street_address = models.CharField(max_length=255)
    ward = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_default", "-updated_at")

    @property
    def full_address(self):
        parts = [self.street_address, self.ward, self.city]
        return ", ".join(part for part in parts if part)

    def save(self, *args, **kwargs):
        if not self.pk and not self.user.addresses.exists():
            self.is_default = True

        super().save(*args, **kwargs)

        if self.is_default:
            self.user.addresses.exclude(pk=self.pk).update(is_default=False)

    def __str__(self):
        return f"{self.full_name} - {self.full_address}"


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_customer_profile(sender, instance, created, **kwargs):
    if created:
        CustomerProfile.objects.create(user=instance)
