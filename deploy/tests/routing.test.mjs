import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';
import { checkAll, read, root, validateCompose, validateNginx } from '../check-config.mjs';
import { validateDns, validateEnvironment } from '../preflight.mjs';
import { validateApp, assertSeparateBuilds } from '../healthcheck.mjs';

test('production routing and build contract passes', () => assert.ok(checkAll()));
mkdirSync(resolve(root, 'deploy/reports'), { recursive: true });
const nginx = read('nginx/conf.d/bloodinfo.conf');
const compose = () => yaml.load(read('docker-compose.yml'));
test('reject main domain pointing to admin', () => assert.throws(() => validateNginx(nginx.replace('set $bloodinfo_app bloodinfo_frontend:80;', 'set $bloodinfo_app bloodinfo_admin:80;'))));
test('reject admin domain pointing to frontend', () => assert.throws(() => validateNginx(nginx.replace('set $bloodinfo_app bloodinfo_admin:80;', 'set $bloodinfo_app bloodinfo_frontend:80;'))));
test('reject both apps using the same frontend upstream', () => assert.throws(() => validateNginx(nginx.replaceAll('bloodinfo_admin:80', 'bloodinfo_frontend:80'))));
test('reject combined server_name even in HTTP redirect/bootstrap', () => {
  assert.throws(() => validateNginx(nginx.replace('server_name bloodinfo.in;', 'server_name bloodinfo.in admin.bloodinfo.in;')));
  assert.throws(() => validateNginx(read('nginx/bootstrap.conf').replace('server_name bloodinfo.in;', 'server_name bloodinfo.in admin.bloodinfo.in;'), true));
});
test('reject both apps built from the main source', () => {
  const config = compose(); config.services.bloodinfo_admin.build.context = './Frontend';
  assert.throws(() => validateCompose(config));
});
test('reject both apps built from the admin source', () => {
  const config = compose(); config.services.bloodinfo_frontend.build.context = './admin';
  assert.throws(() => validateCompose(config));
});
for (const name of ['bloodinfo_backend', 'bloodinfo_frontend', 'bloodinfo_admin']) {
  test(`reject published host ports on ${name}`, () => {
    const config = compose(); config.services[name].ports = ['5000:5000'];
    assert.throws(() => validateCompose(config));
  });
}
test('reject replacing external proxy network', () => {
  const config = compose(); config.networks.goairclass_proxy.external = false;
  assert.throws(() => validateCompose(config));
});
test('reject duplicate gateway or legacy container names', () => {
  const config = compose(); config.services.nginx = { ports: ['80:80'] };
  assert.throws(() => validateCompose(config));
  const legacy = compose(); legacy.services.bloodinfo_admin.container_name = 'raktdaan_admin';
  assert.throws(() => validateCompose(legacy));
});
test('reject DNS mismatch, additional addresses, and unconfigured IPv6', () => {
  validateDns(['200.234.45.233']);
  assert.throws(() => validateDns(['192.0.2.1']));
  assert.throws(() => validateDns(['200.234.45.233', '192.0.2.1']));
  assert.throws(() => validateDns(['200.234.45.233'], ['2001:db8::1']));
});
test('reject missing/placeholder production env without generating secrets', () => {
  assert.throws(() => validateEnvironment(''), /Missing\/placeholder/);
  assert.throws(() => validateEnvironment(read('Backend/.env.example')), /Missing\/placeholder/);
});
test('database name remains configurable and retained', () => {
  assert.match(read('Backend/config/db.js'), /process\.env\.DB_NAME/);
  assert.match(read('Backend/.env.example'), /DB_NAME=Raktdaan/);
});

function observation(app = 'frontend') {
  const commit = 'a'.repeat(40), body = Buffer.from(`<html>${app}</html>`);
  const manifest = { app, commit, htmlSha256: createHash('sha256').update(body).digest('hex'), buildSha256: 'b'.repeat(64) };
  const response = body => ({ status: 200, headers: { 'x-bloodinfo-app': app }, body });
  return { app, commit, head: response(Buffer.alloc(0)), html: response(body), info: response(Buffer.from(JSON.stringify(manifest))),
    api: response(Buffer.from(JSON.stringify({ app: 'bloodinfo_backend', ready: true }))),
    redirect: { status: 301, headers: { location: `https://${app === 'frontend' ? 'bloodinfo.in' : 'admin.bloodinfo.in'}/` } }, expected: manifest };
}
test('health checker accepts both independent app observations', () => {
  validateApp(observation('frontend')); validateApp(observation('admin'));
});
test('health checker rejects wrong app header', () => {
  const o = observation(); o.head.headers['x-bloodinfo-app'] = 'admin';
  assert.throws(() => validateApp(o));
});
test('health checker rejects wrong manifest despite correct header', () => {
  const o = observation(); o.info.body = Buffer.from(JSON.stringify({ ...o.expected, app: 'admin' }));
  assert.throws(() => validateApp(o));
});
test('health checker rejects stale builds and wrong HTML', () => {
  const stale = observation(); stale.commit = 'c'.repeat(40); assert.throws(() => validateApp(stale));
  const wrong = observation(); wrong.html.body = Buffer.from('<html>admin</html>'); assert.throws(() => validateApp(wrong));
});
test('health checker rejects redirects to the other domain', () => {
  const o = observation(); o.redirect.headers.location = 'https://admin.bloodinfo.in/';
  assert.throws(() => validateApp(o));
  const https = observation(); https.head.status = 302; https.head.headers.location = 'https://admin.bloodinfo.in/';
  assert.throws(() => validateApp(https));
});
test('health checker rejects identical HTML or build fingerprints', () => {
  const a = observation('frontend').expected, b = observation('admin').expected;
  assert.throws(() => assertSeparateBuilds([a, { ...b, htmlSha256: a.htmlSha256 }]));
  assert.throws(() => assertSeparateBuilds([a, { ...b, buildSha256: a.buildSha256 }]));
});
test('secrets, private keys and reports are ignored', () => {
  const ignore = read('.gitignore');
  for (const pattern of ['.env', '.env.*', '*.pem', '*.key', 'id_rsa*', 'id_ed25519*', 'deploy/reports/']) assert.ok(ignore.split(/\r?\n/).includes(pattern));
  assert.ok(read('Backend/.dockerignore').includes('.sessions/'));
});
test('only owned gateway config and certificate can be changed', () => {
  const lib = read('scripts/lib-deploy.sh');
  assert.ok(lib.includes('NGINX_TARGET="$NGINX_CONF_DIR/bloodinfo.conf"'));
  assert.ok(lib.includes('test -s') || lib.includes('-s "$LE_CERT_SOURCE/live/bloodinfo/fullchain.pem"'));
  assert.match(lib, /Reusing dedicated BloodInfo certificate/);
  assert.match(lib, /--cert-name bloodinfo -d bloodinfo\.in -d admin\.bloodinfo\.in/);
  assert.match(lib, /DNS|preflight\.mjs/);
  for (const file of ['scripts/lib-deploy.sh', 'scripts/deploy.sh', 'scripts/renew-ssl.sh']) {
    const text = read(file);
    assert.doesNotMatch(text, /docker (?:system|volume|network|image) prune|docker compose down|docker (?:stop|restart|rm)\b|--publish|--force-renewal/);
  }
});
test('CI gates deployment behind tests, exact SHA and verified SSH host keys', () => {
  const workflow = yaml.load(read('.github/workflows/deploy.yml'));
  assert.deepEqual(workflow.jobs.deploy.needs, ['validate']);
  assert.match(workflow.jobs.deploy.if, /BLOODINFO_DEPLOY_ENABLED/);
  assert.match(workflow.jobs.deploy.if, /refs\/heads\/main/);
  assert.match(read('.github/workflows/deploy.yml'), /StrictHostKeyChecking=yes/);
  assert.match(read('.github/workflows/deploy.yml'), /git archive/);
  assert.match(read('.github/workflows/deploy.yml'), /sha256sum --check/);
  assert.doesNotMatch(read('.github/workflows/deploy.yml'), /git reset --hard|docker.*prune/);
});

const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash';
const hasBash = spawnSync(bash, ['--version']).status === 0;
const quote = s => "'" + s.replace(/^([A-Za-z]):\//, (_m, drive) => `/${drive.toLowerCase()}/`).replaceAll("'", "'\\''") + "'";
for (const fail of [false, true]) {
  test(`nginx reload ${fail ? 'is blocked when nginx -t fails' : 'follows a successful nginx -t'}`, { skip: !hasBash }, () => {
    const dir = mkdtempSync(join(root, 'deploy/reports/bloodinfo-nginx-test-'));
    const log = join(dir, 'calls').replaceAll('\\', '/');
    const script = `source ${quote(resolve(root, 'scripts/lib-deploy.sh').replaceAll('\\', '/'))}
CENTRAL_NGINX=gymproplus-nginx-1
docker() { printf '%s\\n' "$*" >> ${quote(log)}; if [ "$*" = 'exec gymproplus-nginx-1 nginx -t' ]; then return ${fail ? 1 : 0}; fi; }
nginx_test_reload`;
    const result = spawnSync(bash, ['-c', script], { encoding: 'utf8' });
    assert.equal(result.status, fail ? 1 : 0, result.stderr);
    const calls = readFileSync(log, 'utf8').trim().split('\n');
    assert.deepEqual(calls, fail ? ['exec gymproplus-nginx-1 nginx -t'] : ['exec gymproplus-nginx-1 nginx -t', 'exec gymproplus-nginx-1 nginx -s reload']);
  });
}

for (const scenario of ['existing', 'first', 'bad-acme']) {
  test(`SSL bootstrap behavior: ${scenario}`, { skip: !hasBash }, () => {
    const dir = mkdtempSync(join(root, 'deploy/reports/bloodinfo-ssl-test-')).replaceAll('\\', '/');
    mkdirSync(`${dir}/certs/live/bloodinfo`, { recursive: true });
    mkdirSync(`${dir}/webroot/.well-known/acme-challenge`, { recursive: true });
    if (scenario === 'existing') writeFileSync(`${dir}/certs/live/bloodinfo/fullchain.pem`, 'test-fixture');
    const sha = 'a'.repeat(40), log = `${dir}/calls`;
    const script = `source ${quote(resolve(root, 'scripts/lib-deploy.sh').replaceAll('\\', '/'))}
LE_CERT_SOURCE=${quote(dir + '/certs')}
CERTBOT_WEBROOT=${quote(dir + '/webroot')}
RELEASE_DIR=${quote(dir)}
SOURCE_COMMIT=${sha}
CERTBOT_EMAIL=ci@example.invalid
certificate_state() { echo valid; }
install_nginx() { printf 'install %s\\n' "$1" >> ${quote(log)}; }
run_certbot() { printf 'certbot %s\\n' "$*" >> ${quote(log)}; }
curl() { printf '%s' ${quote(scenario === 'bad-acme' ? 'wrong-response' : 'bloodinfo-acme-' + sha)}; }
ensure_bloodinfo_ssl`;
    const result = spawnSync(bash, ['-c', script], { encoding: 'utf8' });
    assert.equal(result.status, scenario === 'bad-acme' ? 1 : 0, result.stderr);
    if (scenario === 'existing') {
      assert.match(result.stdout, /Reusing dedicated/);
      assert.equal(spawnSync(bash, ['-c', `test ! -e ${quote(log)}`]).status, 0, 'Reuse must not issue or modify nginx');
    } else {
      const calls = readFileSync(log, 'utf8');
      assert.match(calls, /install .*\/nginx\/bootstrap\.conf/);
      if (scenario === 'bad-acme') {
        assert.doesNotMatch(calls, /certbot /);
        assert.match(result.stdout, /Public ACME challenge verification failed/);
      }
      else assert.match(calls, /certbot certonly .*--cert-name bloodinfo -d bloodinfo\.in -d admin\.bloodinfo\.in/);
    }
  });
}

test('failed nginx config restores only the owned previous file', { skip: !hasBash }, () => {
  const dir = mkdtempSync(join(root, 'deploy/reports/bloodinfo-rollback-test-')).replaceAll('\\', '/');
  for (const folder of ['nginx', 'shared', 'central']) mkdirSync(`${dir}/${folder}`, { recursive: true });
  writeFileSync(`${dir}/nginx/bootstrap.conf`, 'bad-new-config');
  writeFileSync(`${dir}/central/bloodinfo.conf`, 'previous-good-config');
  writeFileSync(`${dir}/central/unrelated.conf`, 'leave-this-unchanged');
  const script = `source ${quote(resolve(root, 'scripts/lib-deploy.sh').replaceAll('\\', '/'))}
RELEASE_DIR=${quote(dir)}
SHARED_DIR=${quote(dir + '/shared')}
NGINX_CONF_DIR=${quote(dir + '/central')}
NGINX_TARGET=${quote(dir + '/central/bloodinfo.conf')}
nginx_test_reload() { if grep -q bad-new-config "$NGINX_TARGET"; then return 1; fi; }
install_nginx "$RELEASE_DIR/nginx/bootstrap.conf"`;
  const result = spawnSync(bash, ['-c', script], { encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(readFileSync(`${dir}/central/bloodinfo.conf`, 'utf8'), 'previous-good-config');
  assert.equal(readFileSync(`${dir}/central/unrelated.conf`, 'utf8'), 'leave-this-unchanged');
});
