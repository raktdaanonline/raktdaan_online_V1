#!/usr/bin/env bash
# Shared helpers; no actions run merely by sourcing this file.
set -euo pipefail

nginx_test_reload() {
  docker exec "$CENTRAL_NGINX" nginx -t || return 1
  docker exec "$CENTRAL_NGINX" nginx -s reload
}

load_deployment() {
  RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  DEPLOY_ROOT=/opt/bloodinfo-app
  CENTRAL_NGINX=gymproplus-nginx-1
  NGINX_CONF_DIR=/var/www/gymproplus/nginx/conf.d
  NGINX_TARGET="$NGINX_CONF_DIR/bloodinfo.conf"
  CERTBOT_WEBROOT=/var/lib/docker/volumes/gymproplus_certbot_www/_data
  SHARED_DIR="$DEPLOY_ROOT/shared"
  BLOODINFO_APP_ENV="$SHARED_DIR/Backend/.env"
  test "$(id -u)" = 0 || { echo 'Deploy as root; shared nginx/certificate mounts require root.'; return 1; }
  test -s "$DEPLOY_ROOT/deploy/.env" || { echo 'Missing /opt/bloodinfo-app/deploy/.env'; return 1; }
  # This trusted, server-owned file contains only deployment settings.
  source "$DEPLOY_ROOT/deploy/.env"
  [[ "${SOURCE_COMMIT:-}" =~ ^[a-f0-9]{40}$ ]] || { echo 'An exact release SHA is required'; return 1; }
  test "$RELEASE_DIR" = "$DEPLOY_ROOT/releases/$SOURCE_COMMIT" || { echo 'Unexpected release path'; return 1; }
  test "${DEPLOY_ENABLED:-false}" = true || { echo 'Server deployment gate is disabled'; return 1; }
  test "${DATA_MIGRATION_CONFIRMED:-false}" = true || { echo 'Confirm existing uploads, WhatsApp sessions and database configuration first'; return 1; }
  test -s "$BLOODINFO_APP_ENV" || { echo 'Missing production shared/Backend/.env'; return 1; }
  export SOURCE_COMMIT BLOODINFO_APP_ENV
  COMPOSE=(docker compose -p bloodinfo --project-directory "$RELEASE_DIR" -f "$RELEASE_DIR/docker-compose.yml")
}

node_tool() {
  docker run --rm --name bloodinfo_tooling --network goairclass_proxy \
    --mount "type=bind,src=$RELEASE_DIR,dst=/work,readonly" \
    --workdir /work node:20-alpine node "$@"
}

shared_preflight() {
  command -v flock > /dev/null
  command -v curl > /dev/null
  docker compose version
  docker network inspect goairclass_proxy > /dev/null
  test "$(docker inspect -f '{{.State.Running}}' "$CENTRAL_NGINX")" = true
  test "$(docker inspect -f '{{if index .NetworkSettings.Networks "goairclass_proxy"}}yes{{end}}' "$CENTRAL_NGINX")" = yes \
    || { echo 'Central nginx must already join goairclass_proxy; no unrelated network will be changed'; return 1; }
  local config_source webroot_source
  config_source="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d"}}{{.Source}}{{end}}{{end}}' "$CENTRAL_NGINX")"
  if [ -z "$config_source" ]; then
    config_source="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/nginx"}}{{.Source}}/conf.d{{end}}{{end}}' "$CENTRAL_NGINX")"
  fi
  test "$config_source" = "$NGINX_CONF_DIR" || { echo 'Unexpected central nginx config mount'; return 1; }
  webroot_source="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/var/www/certbot"}}{{.Source}}{{end}}{{end}}' "$CENTRAL_NGINX")"
  test "$webroot_source" = "$CERTBOT_WEBROOT" || { echo 'Unexpected ACME webroot mount'; return 1; }
  LE_CERT_SOURCE="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/letsencrypt"}}{{.Source}}{{end}}{{end}}' "$CENTRAL_NGINX")"
  [[ "$LE_CERT_SOURCE" = /* && "$LE_CERT_SOURCE" != / ]] && test -d "$LE_CERT_SOURCE" \
    || { echo 'Could not identify existing LetsEncrypt mount; refusing to create a separate certificate store'; return 1; }
  test ! -L "$NGINX_TARGET" || { echo 'Refusing to replace a symlinked nginx config'; return 1; }
  if [ -e "$NGINX_TARGET" ]; then
    grep -q '^# BloodInfo-owned' "$NGINX_TARGET" || { echo 'Existing bloodinfo.conf ownership needs manual review'; return 1; }
  fi
  if [ -e /etc/cron.d/bloodinfo-renew ]; then
    grep -q '^# Managed by BloodInfo deployment' /etc/cron.d/bloodinfo-renew || return 1
  fi
  # A matching name alone does not authorize changing another project's resource.
  local name owner
  for name in bloodinfo_backend bloodinfo_frontend bloodinfo_admin; do
    if docker container inspect "$name" > /dev/null 2>&1; then
      owner="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$name")"
      test "$owner" = bloodinfo || { echo "Container $name belongs to another project; refusing deployment"; return 1; }
    fi
  done
  if docker network inspect bloodinfo_internal > /dev/null 2>&1; then
    owner="$(docker network inspect -f '{{index .Labels "com.docker.compose.project"}}' bloodinfo_internal)"
    test "$owner" = bloodinfo || { echo 'Existing bloodinfo_internal ownership is unverified'; return 1; }
  fi
  for name in bloodinfo_uploads bloodinfo_sessions; do
    if docker volume inspect "$name" > /dev/null 2>&1; then
      owner="$(docker volume inspect -f '{{index .Labels "com.docker.compose.project"}}' "$name")"
      test "$owner" = bloodinfo || { echo "Volume $name ownership is unverified; review migration first"; return 1; }
    fi
  done
  if [ ! -s "$LE_CERT_SOURCE/live/bloodinfo/fullchain.pem" ]; then
    [[ "${CERTBOT_EMAIL:-}" = *@* ]] || { echo 'CERTBOT_EMAIL is required before first deployment'; return 1; }
  else
    certificate_state > /dev/null
  fi
  docker run --rm --name bloodinfo_preflight --network goairclass_proxy \
    --mount "type=bind,src=$RELEASE_DIR,dst=/work,readonly" \
    --mount "type=bind,src=$BLOODINFO_APP_ENV,dst=/run/bloodinfo.env,readonly" \
    --mount "type=bind,src=$NGINX_CONF_DIR,dst=/central,readonly" \
    node:20-alpine node /work/deploy/preflight.mjs
  docker exec "$CENTRAL_NGINX" nginx -t
  echo 'Legacy-name inventory (read-only; no legacy resources are stopped/deleted):'
  docker ps -a --filter name=raktdaan --format '{{.Names}} project={{.Label "com.docker.compose.project"}}'
  docker volume ls --format '{{.Name}}' | grep -i raktdaan || true
}

install_nginx() {
  local source="$1" previous="$SHARED_DIR/nginx.previous.conf"
  case "$source" in
    "$RELEASE_DIR/nginx/bootstrap.conf"|"$RELEASE_DIR/nginx/conf.d/bloodinfo.conf") ;;
    *) echo 'Refusing an unexpected nginx source'; return 1 ;;
  esac
  if [ -e "$NGINX_TARGET" ]; then cp "$NGINX_TARGET" "$previous"; else rm -f "$previous"; fi
  install -m 644 "$source" "$NGINX_CONF_DIR/.bloodinfo.conf.tmp"
  mv -f "$NGINX_CONF_DIR/.bloodinfo.conf.tmp" "$NGINX_TARGET"
  if ! nginx_test_reload; then
    if [ -e "$previous" ]; then
      cp "$previous" "$NGINX_TARGET"
    else
      rm -f "$NGINX_TARGET"
    fi
    nginx_test_reload || true
    return 1
  fi
}

run_certbot() {
  mkdir -p "$SHARED_DIR/certbot-work" "$SHARED_DIR/certbot-logs"
  docker run --rm --name bloodinfo_certbot --network goairclass_proxy \
    --mount "type=bind,src=$CERTBOT_WEBROOT,dst=/var/www/certbot" \
    --mount "type=bind,src=$LE_CERT_SOURCE,dst=/etc/letsencrypt" \
    --mount "type=bind,src=$SHARED_DIR/certbot-work,dst=/var/lib/letsencrypt" \
    --mount "type=bind,src=$SHARED_DIR/certbot-logs,dst=/var/log/letsencrypt" \
    certbot/certbot "$@"
}

certificate_state() {
  docker run --rm --name bloodinfo_certcheck --network none \
    --mount "type=bind,src=$RELEASE_DIR,dst=/work,readonly" \
    --mount "type=bind,src=$LE_CERT_SOURCE,dst=/certs,readonly" \
    node:20-alpine node /work/deploy/check-certificate.mjs
}

ensure_bloodinfo_ssl() {
  if [ -s "$LE_CERT_SOURCE/live/bloodinfo/fullchain.pem" ]; then
    echo 'Reusing dedicated BloodInfo certificate'
    certificate_status="$(certificate_state)"
    if [ "$certificate_status" = renew ]; then
      run_certbot renew --cert-name bloodinfo --non-interactive
    fi
    return
  fi
  [[ "${CERTBOT_EMAIL:-}" = *@* ]] || { echo 'CERTBOT_EMAIL is required before first certificate issuance'; return 1; }
  install_nginx "$RELEASE_DIR/nginx/bootstrap.conf"
  local token content domain
  token="bloodinfo-$SOURCE_COMMIT"
  content="bloodinfo-acme-$SOURCE_COMMIT"
  mkdir -p "$CERTBOT_WEBROOT/.well-known/acme-challenge"
  printf '%s' "$content" > "$CERTBOT_WEBROOT/.well-known/acme-challenge/$token"
  for domain in bloodinfo.in admin.bloodinfo.in; do
    test "$(curl --fail --silent --show-error "http://$domain/.well-known/acme-challenge/$token")" = "$content" \
      || { rm -f "$CERTBOT_WEBROOT/.well-known/acme-challenge/$token"; echo 'Public ACME challenge verification failed'; return 1; }
  done
  rm -f "$CERTBOT_WEBROOT/.well-known/acme-challenge/$token"
  run_certbot certonly --webroot --webroot-path /var/www/certbot \
    --cert-name bloodinfo -d bloodinfo.in -d admin.bloodinfo.in \
    --email "$CERTBOT_EMAIL" --agree-tos --non-interactive --keep-until-expiring
}
