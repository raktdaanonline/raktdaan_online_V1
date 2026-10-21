#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib-deploy.sh"
load_deployment
mkdir -p "$SHARED_DIR" "$RELEASE_DIR/deploy/reports"
exec 9> "$SHARED_DIR/deploy.lock"
flock -n 9 || { echo 'Another BloodInfo deploy/renewal is running'; exit 1; }
shared_preflight

cat <<'ARCHITECTURE'
BloodInfo production preflight:
Frontend source: Frontend -> bloodinfo_frontend:80
Admin source: admin -> bloodinfo_admin:80
Backend source: Backend -> bloodinfo_backend:5000
bloodinfo.in -> bloodinfo_frontend:80; /api/* -> bloodinfo_backend:5000
admin.bloodinfo.in -> bloodinfo_admin:80; /api/* -> bloodinfo_backend:5000
Networks: bloodinfo_internal; external goairclass_proxy
Host application ports: ZERO
Gateway: existing gymproplus-nginx-1 (test and safe reload only)
Deploy root: /opt/bloodinfo-app
ARCHITECTURE

# Small tooling dependency set only; app dependencies are built inside Docker.
docker run --rm --name bloodinfo_test_dependencies --network goairclass_proxy \
  --mount "type=bind,src=$RELEASE_DIR,dst=/work" --workdir /work \
  node:20-alpine npm ci --prefix deploy --no-audit --no-fund
node_tool deploy/check-config.mjs
docker run --rm --name bloodinfo_tests --network none \
  --mount "type=bind,src=$RELEASE_DIR,dst=/work,readonly" \
  --mount "type=bind,src=$RELEASE_DIR/deploy/reports,dst=/work/deploy/reports" --workdir /work/deploy \
  node:20-alpine npm test
"${COMPOSE[@]}" config --quiet

# Take an initial backup of only our owned file. The gateway is never recreated.
if [ -e "$NGINX_TARGET" ]; then
  cp "$NGINX_TARGET" "$SHARED_DIR/nginx.before-deploy.conf"
else
  rm -f "$SHARED_DIR/nginx.before-deploy.conf"
fi
previous_release="$(readlink -f "$DEPLOY_ROOT/current" 2>/dev/null || true)"
app_changed=false
rollback() {
  local status=$?
  trap - EXIT
  if [ "$status" -ne 0 ]; then
    echo 'BloodInfo deployment failed; restoring only BloodInfo routing/resources'
    if [ "$app_changed" = true ] && [[ "$previous_release" =~ ^/opt/bloodinfo-app/releases/[a-f0-9]{40}$ ]] && [ -s "$previous_release/docker-compose.yml" ]; then
      SOURCE_COMMIT="${previous_release##*/}" docker compose -p bloodinfo --project-directory "$previous_release" \
        -f "$previous_release/docker-compose.yml" up -d --no-build --wait --wait-timeout 180 || true
    fi
    if [ -s "$SHARED_DIR/nginx.before-deploy.conf" ]; then
      cp "$SHARED_DIR/nginx.before-deploy.conf" "$NGINX_TARGET"
    else
      # First-deploy failure must return 503, never another project's frontend.
      cp "$RELEASE_DIR/nginx/bootstrap.conf" "$NGINX_TARGET"
    fi
    nginx_test_reload || true
  fi
  exit "$status"
}
trap rollback EXIT

export COMPOSE_PARALLEL_LIMIT=1
for service in bloodinfo_backend bloodinfo_frontend bloodinfo_admin; do
  "${COMPOSE[@]}" build --pull "$service"
done
app_changed=true
"${COMPOSE[@]}" up -d --no-build --wait --wait-timeout 180 \
  bloodinfo_backend bloodinfo_frontend bloodinfo_admin
for app in frontend admin; do
  docker exec "bloodinfo_$app" wget -qO- http://127.0.0.1/bloodinfo-build.json > "$RELEASE_DIR/deploy/reports/$app.json"
done
ensure_bloodinfo_ssl
install_nginx "$RELEASE_DIR/nginx/conf.d/bloodinfo.conf"
proxy_ip="$(docker inspect -f '{{(index .NetworkSettings.Networks "goairclass_proxy").IPAddress}}' "$CENTRAL_NGINX")"
node_tool deploy/healthcheck.mjs --commit "$SOURCE_COMMIT" --ip "$proxy_ip" --expected-dir /work/deploy/reports
node_tool deploy/healthcheck.mjs --commit "$SOURCE_COMMIT" --expected-dir /work/deploy/reports

if [ -e "$DEPLOY_ROOT/current" ] && [ ! -L "$DEPLOY_ROOT/current" ]; then
  echo 'Refusing to replace a non-symlink current directory'; exit 1
fi
ln -sfn "$RELEASE_DIR" "$DEPLOY_ROOT/current"
cat > /etc/cron.d/bloodinfo-renew <<'CRON'
# Managed by BloodInfo deployment
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
17 */12 * * * root /bin/bash /opt/bloodinfo-app/current/scripts/renew-ssl.sh >> /opt/bloodinfo-app/shared/renew-ssl.log 2>&1
CRON
chmod 644 /etc/cron.d/bloodinfo-renew
trap - EXIT
echo "BloodInfo $SOURCE_COMMIT deployed; both domain headers, HTML fingerprints and APIs verified"
