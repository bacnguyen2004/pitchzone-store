from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

User = get_user_model()


class ForgotPasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="fanbongda",
            email="fan@pitchzone.test",
            password="oldpass123",
        )

    def test_forgot_password_sends_email_for_existing_user(self):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "fan@pitchzone.test"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("reset-password", mail.outbox[0].body)
        self.assertIn("fan@pitchzone.test", mail.outbox[0].to)
        self.assertIn("Đã gửi link", response.data["detail"])

    def test_forgot_password_rejects_unknown_email(self):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "unknown@pitchzone.test"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(mail.outbox), 0)
        self.assertIn("không tồn tại", response.data["email"][0].lower())

    def test_forgot_password_normalizes_email(self):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "  FAN@PitchZone.TEST  "},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)


class ResetPasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="resetuser",
            email="reset@pitchzone.test",
            password="oldpass123",
        )
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = default_token_generator.make_token(self.user)

    def test_reset_password_updates_password(self):
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "uid": self.uid,
                "token": self.token,
                "password": "newpass123",
                "password_confirm": "newpass123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpass123"))

    def test_reset_password_rejects_mismatched_confirmation(self):
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "uid": self.uid,
                "token": self.token,
                "password": "newpass123",
                "password_confirm": "different123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("oldpass123"))

    def test_reset_password_rejects_invalid_token(self):
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "uid": self.uid,
                "token": "invalid-token",
                "password": "newpass123",
                "password_confirm": "newpass123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("hết hạn", response.data["detail"])

    @override_settings(FRONTEND_URL="http://localhost:5173")
    def test_password_reset_url_contains_frontend_path(self):
        from accounts.services.email import build_password_reset_url

        url = build_password_reset_url(self.user)
        self.assertTrue(url.startswith("http://localhost:5173/reset-password?"))
        self.assertIn("uid=", url)
        self.assertIn("token=", url)