#!/usr/bin/env bash
set -euo pipefail
# Resolve current to the exact release so deploy and renewal use identical helpers.
script_path="$(readlink -f "${BASH_SOURCE[0]}")"
export SOURCE_COMMIT="$(basename "$(dirname "$(dirname "$script_path")")")"
source "$(dirname "$script_path")/lib-deploy.sh"
load_deployment
exec 9> "$SHARED_DIR/deploy.lock"
flock -n 9 || exit 0
shared_preflight
run_certbot renew --cert-name bloodinfo --non-interactive
nginx_test_reload
