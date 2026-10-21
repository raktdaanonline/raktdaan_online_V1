# BloodInfo on the existing shared VPS

The VPS is 200.234.45.233. Host ports 80/443 remain owned by the existing
gymproplus-nginx-1 container. BloodInfo does not create a gateway or publish
application ports. No unrelated container, network, volume, config or certificate
is restarted, renamed or deleted.

## Routing and builds

| Domain / path | Container | Internal port | Build context |
| --- | --- | --- | --- |
| bloodinfo.in | bloodinfo_frontend | 80 | Frontend/ |
| admin.bloodinfo.in | bloodinfo_admin | 80 | admin/ |
| Both domains: /api/*, /socket.io/*, /uploads/* | bloodinfo_backend | 5000 | Backend/ |

Every domain has its own exact HTTP and HTTPS server block, including bootstrap.
The frontend/admin Dockerfiles compile their own contexts and copy only their
own builder's /app/dist. Docker DNS uses unique bloodinfo_* names. A Docker DNS
resolver refreshes upstream IPs after app containers are replaced.

All three services join bloodinfo_internal (a private, internal network) and
existing external goairclass_proxy, so the central gateway can reach all three.
The central gateway must already be attached to goairclass_proxy. Deployment
fails safely if it is not; it never reconnects/recreates shared infrastructure.

Responses include X-BloodInfo-App: frontend or admin. Each app also emits
/bloodinfo-build.json containing its app identifier, release SHA, HTML hash and
build hash. Health checks compare HEAD headers, actual HTML, distinct hashes,
exact commit, directly inspected container manifests, same-host redirects and
shared backend readiness on BOTH domains. Headers alone cannot pass this check.

## Deployment gates and required secrets

The deploy root is /opt/bloodinfo-app. Exact source releases live under
releases/<40-character-SHA>; current points to the last healthy release.
Production files stay outside releases and are never transferred by CI:

- /opt/bloodinfo-app/deploy/.env (copy deploy/.env.example)
- /opt/bloodinfo-app/shared/Backend/.env (copy Backend/.env.example)

Create these with restricted permissions (600). Configure real MongoDB, JWT,
admin, SMTP, Cloudinary, Gemini and mode-matched Razorpay values; placeholders fail
preflight. Keep the existing DB_NAME and MongoDB data. There is no database
rename, automatic migration or additional production MongoDB/Redis container.
The deployment does not use or overwrite the developer's local Backend/.env.

Razorpay TEST mode is explicitly allowed for the current launch. Add this line
to /opt/bloodinfo-app/shared/Backend/.env (the backend's Compose env_file):

    RAZORPAY_MODE=test

Keep the existing test credentials unchanged: RAZORPAY_KEY_ID must start with
rzp_test_ and RAZORPAY_KEY_SECRET must be non-empty. Both preflight and backend
startup validate the mode/key pair. Test credentials use Razorpay's sandbox;
no real money is charged in [Test mode](https://github.com/razorpay/markdown-docs/blob/master/payments/dashboard/test-live-modes.md).
No frontend mode setting or separate Razorpay URL is needed.

When intentionally enabling real payments later, set RAZORPAY_MODE=live and
provide an rzp_live_ key and its secret together. Missing/unknown modes,
cross-mode keys, missing keys and missing secrets fail validation. This setting
does not change DNS, database, JWT, Nginx, Docker, deployment-gate or SSL checks.

| GitHub Actions secret | Required value |
| --- | --- |
| VPS_HOST | 200.234.45.233 |
| VPS_USER | root |
| VPS_PORT | 22 |
| VPS_SSH_KEY | Private key authorized for this server/user |
| VPS_KNOWN_HOSTS | Independently verified known_hosts entry for the VPS |
| DEPLOY_PATH | /opt/bloodinfo-app |

SSH always uses StrictHostKeyChecking=yes. Do not replace verification with
ssh-keyscan output obtained without independently checking the fingerprint.
Docker Hub credentials and the old VPS_APP_DIR secret are no longer used.

Automatic deployment is disabled unless GitHub repository variable
BLOODINFO_DEPLOY_ENABLED=true AND server deploy/.env has DEPLOY_ENABLED=true.
Only main can deploy; bloodinfo/* branches and pull requests run validation only.
Leave both disabled until DNS, production credentials and existing data are
reviewed. DATA_MIGRATION_CONFIRMED=true is also required on the server.
CERTBOT_EMAIL must contain a real email before first SSL issuance.

## First-deployment prerequisites

1. DNS A records for @ (bloodinfo.in) and admin (admin.bloodinfo.in) must both
   resolve only to 200.234.45.233. Remove conflicting AAAA records until an IPv6
   destination is explicitly configured. Deployment verifies DNS before any
   SSL request or app recreation; it never edits DNS provider records.
2. Run sudo bash scripts/setup-vps.sh from a copy of this code to prepare only
   BloodInfo directories. Docker/Compose must already be installed. The script
   does not install or reconfigure server software.
3. Supply the two production .env files above, with real service credentials.
   FRONTEND_URL must be https://bloodinfo.in; PORT must be 5000 if present.
4. Review old resources from THIS project. Inspect Docker Compose project labels,
   mounts and contents before copying data; a name containing raktdaan is not
   proof of ownership. The deploy preflight only inventories these resources.
   Restore local uploads into bloodinfo_uploads and WhatsApp .sessions into
   bloodinfo_sessions, with backups and preserved ownership. Use volumes labeled
   com.docker.compose.project=bloodinfo and com.docker.compose.volume matching
   the volume name. Existing unverified BloodInfo-named resources block deployment.
   Cloudinary data stays in its existing account. Mark DATA_MIGRATION_CONFIRMED
   only after this review/restore. No old resources are automatically stopped or
   removed; retire only verified old-project resources after both new sites pass.
5. Check shared prerequisites: gymproplus-nginx-1 is running, belongs to external
   goairclass_proxy, and mounts the existing config directory/webroot below.
   Its existing LetsEncrypt mount is detected from Docker inspect, never guessed.
6. Configure the GitHub secrets and enable the gates after reviewing validation.
   Push to main or manually run BloodInfo production. A disabled deploy gate
   still runs validation/build/integration tests, and cannot contact the VPS.

## Shared Nginx and SSL safety

The ONLY gateway file written is:
/var/www/gymproplus/nginx/conf.d/bloodinfo.conf

Existing files containing these domains under other names cause preflight to
fail for manual ownership review. An existing bloodinfo.conf without the
BloodInfo ownership marker also blocks replacement. No unrelated config or
existing GymProPlus warning is modified. Every reload follows a successful
nginx -t in gymproplus-nginx-1. Failure restores only the owned previous file.

The dedicated certificate name is bloodinfo, covering exactly bloodinfo.in and
admin.bloodinfo.in. Certificate/key paths in the gateway are
/etc/letsencrypt/live/bloodinfo/fullchain.pem and privkey.pem.

If absent, deployment verifies DNS, installs TWO separate HTTP-only BloodInfo
blocks, tests/reloads the existing gateway, verifies a unique public ACME token
on both domains, and requests only that certificate. It uses the existing host
webroot /var/lib/docker/volumes/gymproplus_certbot_www/_data, mounted as
/var/www/certbot, and the existing gateway's detected certificate store.
It then installs separate HTTPS routes and tests/reloads again. An existing
certificate is reused; only a due BloodInfo certificate is renewed. Certbot
runs temporarily as bloodinfo_certbot with no host ports. It never renews
other projects' certificates.

A dedicated /etc/cron.d/bloodinfo-renew runs only BloodInfo renewal every 12h
through current/scripts/renew-ssl.sh, with the same project lock and guarded
Nginx reload. It is installed only after successful public health checks.
Unknown ownership of this cron filename blocks deployment. A first-deploy
failure retains an HTTP 503 BloodInfo block instead of routing to another app.
A subsequent failure restores the previous owned config/release where available.

## Validation and release flow

CI runs npm ci/test in deploy/, Bash syntax, real Docker Compose validation,
and builds all three contexts at the exact commit. scripts/test-routing.sh then
uses the real images and an isolated disposable CI-only MongoDB to run the
existing backend event tests and HTTPS routing checks. No CI service publishes
host ports. CI test resources are distinct from all production resource names.

Only after all validation passes does CI archive the exact git commit. A
checksum-verified archive is transferred using pinned SSH host keys. The VPS
runs production/DNS/ownership preflight, repeats configuration tests, builds
only BloodInfo images serially, starts only its three services, waits for
readiness, sets up its routes/SSL, and verifies both domains internally and
publicly. No git reset, broad prune, compose down, gateway restart or unrelated
resource cleanup is used.

Local checks:

    npm ci --prefix deploy
    npm test --prefix deploy
    node deploy/check-config.mjs
    npm run build --prefix Frontend
    npm run build --prefix admin
    node deploy/check-builds.mjs

Docker/CI checks additionally require a running Docker daemon. Never run the
legacy backend CRUD/reminder test suite against a production .env/database;
CI supplies its own disposable DB and blocks outbound network access.

Existing business branding, Gmail/social accounts, SMS template and database
names are retained. No production secrets, private keys or .env files belong
in git. The Razorpay code no longer falls back to embedded credentials.
