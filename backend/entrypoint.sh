#!/bin/sh
set -e

echo "==> migrate"
python manage.py migrate --noinput

echo "==> bootstrap_deploy"
python manage.py bootstrap_deploy

echo "==> start gunicorn"
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"