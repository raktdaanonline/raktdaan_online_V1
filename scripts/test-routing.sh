#!/usr/bin/env bash
# CI only: real frontend/admin/backend images, isolated disposable test database.
# Every container remains on a dedicated test network, with ZERO published ports.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
sha="${1:?Pass the built release SHA}"
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || exit 1
network=bloodinfo_routing_test
docker network create --internal "$network" > /dev/null
created=()
cleanup() {
  local name
  for name in "${created[@]}"; do docker rm -f "$name" > /dev/null || true; done
  docker network rm "$network" > /dev/null || true
}
trap cleanup EXIT
start() {
  local name="$1"; shift
  docker run --detach --name "$name" --network "$network" "$@" > /dev/null
  created+=("$name")
}
reports="$PWD/deploy/reports"
mkdir -p "$reports/ci-certs/live/bloodinfo" "$reports/ci-nginx"
cp nginx/conf.d/bloodinfo.conf "$reports/ci-nginx/bloodinfo.conf"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -keyout "$reports/ci-certs/live/bloodinfo/privkey.pem" \
  -out "$reports/ci-certs/live/bloodinfo/fullchain.pem" \
  -subj /CN=bloodinfo.in -addext 'subjectAltName=DNS:bloodinfo.in,DNS:admin.bloodinfo.in' 2> /dev/null
start bloodinfo_ci_mongo mongo:7
for attempt in {1..60}; do
  if docker exec bloodinfo_ci_mongo mongosh --quiet --eval 'quit(db.adminCommand({ping:1}).ok ? 0 : 1)' > /dev/null; then break; fi
  sleep 1
done

# Existing repository tests run only against this disposable DB, never a real .env.
docker run --rm --name bloodinfo_ci_backend_tests --network "$network" \
  --mount "type=bind,src=$PWD/Backend/test_event_calendar.js,dst=/app/test_event_calendar.js,readonly" \
  --env MONGO_URI=mongodb://bloodinfo_ci_mongo:27017 --env DB_NAME=bloodinfo_ci_test \
  --env JWT_SECRET=bloodinfo-ci-only-not-a-production-secret \
  "bloodinfo-backend:$sha" node test_event_calendar.js

start bloodinfo_ci_backend --network-alias bloodinfo_backend \
  --env MONGO_URI=mongodb://bloodinfo_ci_mongo:27017 --env DB_NAME=bloodinfo_ci_test \
  --env PORT=5000 --env NODE_ENV=test --env FRONTEND_URL=https://bloodinfo.in \
  --env JWT_SECRET=bloodinfo-ci-only-not-a-production-secret \
  --env ADMIN_EMAIL=ci@example.invalid --env ADMIN_PASSWORD=ci-only-fixture \
  --env GEMINI_API_KEY=ci-only-fixture --env RAZORPAY_KEY_ID=rzp_test_ci \
  --env RAZORPAY_KEY_SECRET=ci-only-fixture "bloodinfo-backend:$sha"
start bloodinfo_ci_frontend --network-alias bloodinfo_frontend "bloodinfo-frontend:$sha"
start bloodinfo_ci_admin --network-alias bloodinfo_admin "bloodinfo-admin:$sha"
for name in bloodinfo_ci_backend bloodinfo_ci_frontend bloodinfo_ci_admin; do
  endpoint=/bloodinfo-build.json
  if [ "$name" = bloodinfo_ci_backend ]; then endpoint=:5000/healthz; fi
  ready=false
  for attempt in {1..60}; do
    if docker exec "$name" wget -qO- "http://127.0.0.1$endpoint" > /dev/null; then ready=true; break; fi
    sleep 1
  done
  test "$ready" = true || { docker logs "$name"; exit 1; }
done
for app in frontend admin; do
  docker exec "bloodinfo_ci_$app" wget -qO- http://127.0.0.1/bloodinfo-build.json > "$reports/$app.json"
done
start bloodinfo_ci_proxy \
  --mount "type=bind,src=$reports/ci-nginx,dst=/etc/nginx/conf.d,readonly" \
  --mount "type=bind,src=$reports/ci-certs,dst=/etc/letsencrypt,readonly" nginx:alpine
docker exec bloodinfo_ci_proxy nginx -t
ip="$(docker inspect -f "{{(index .NetworkSettings.Networks \"$network\").IPAddress}}" bloodinfo_ci_proxy)"
docker run --rm --name bloodinfo_ci_probe --network "$network" \
  --env NODE_EXTRA_CA_CERTS=/test-ca/fullchain.pem \
  --mount "type=bind,src=$reports/ci-certs/live/bloodinfo,dst=/test-ca,readonly" \
  --mount "type=bind,src=$PWD,dst=/work,readonly" \
  node:20-alpine node /work/deploy/healthcheck.mjs --commit "$sha" --ip "$ip" --expected-dir /work/deploy/reports
echo 'Docker routing integration: both separate apps, exact SHA, distinct HTML/builds and shared backend passed'
