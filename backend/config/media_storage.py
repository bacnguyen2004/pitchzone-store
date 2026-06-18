"""Cấu hình lưu media: local filesystem hoặc Cloudinary."""

from __future__ import annotations

import sys
from typing import Any


def is_cloudinary_configured(
    cloud_name: str,
    api_key: str,
    api_secret: str,
) -> bool:
    return bool(cloud_name and api_key and api_secret)


def should_use_cloudinary(
    *,
    enabled: bool,
    cloud_name: str,
    api_key: str,
    api_secret: str,
) -> bool:
    if "test" in sys.argv:
        return False
    if not enabled:
        return False
    return is_cloudinary_configured(cloud_name, api_key, api_secret)


def build_storages(*, use_cloudinary: bool) -> dict[str, dict[str, str]]:
    storages: dict[str, dict[str, str]] = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }

    if use_cloudinary:
        storages["default"] = {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        }

    return storages


def build_cloudinary_settings(
    *,
    cloud_name: str,
    api_key: str,
    api_secret: str,
) -> dict[str, Any]:
    return {
        "CLOUD_NAME": cloud_name,
        "API_KEY": api_key,
        "API_SECRET": api_secret,
        "SECURE": True,
    }