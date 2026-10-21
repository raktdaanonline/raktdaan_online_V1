#!/usr/bin/env bash
# Prepare only BloodInfo-owned directories on the existing shared VPS.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
install -d -m 755 /opt/bloodinfo-app/deploy /opt/bloodinfo-app/shared/Backend /opt/bloodinfo-app/releases /opt/bloodinfo-app/incoming
if [ ! -e /opt/bloodinfo-app/deploy/.env ]; then
  install -m 600 deploy/.env.example /opt/bloodinfo-app/deploy/.env
fi
cat <<'INFO'
BloodInfo directories prepared; no shared infrastructure was changed.
Set real app credentials in /opt/bloodinfo-app/shared/Backend/.env.
Review existing BloodInfo/Raktdaan uploads and WhatsApp sessions before enabling DATA_MIGRATION_CONFIRMED.
Set CERTBOT_EMAIL in /opt/bloodinfo-app/deploy/.env.
Enable server DEPLOY_ENABLED and GitHub variable BLOODINFO_DEPLOY_ENABLED only when ready.
DNS: bloodinfo.in and admin.bloodinfo.in must resolve to 200.234.45.233.
Existing proxy network, gateway, certificates and unrelated applications are retained.
INFO
