import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const read = file => readFileSync(resolve(root, file), 'utf8');
export const mapping = { 'bloodinfo.in': 'frontend', 'admin.bloodinfo.in': 'admin' };

// Parse nested blocks rather than matching across adjacent server blocks.
export function blocks(text, pattern) {
  text = text.replace(/#[^\n]*/g, '');
  const result = [];
  const re = new RegExp(pattern + '\\s*\\{', 'g');
  let match;
  while ((match = re.exec(text))) {
    const start = re.lastIndex;
    let depth = 1, end = start;
    for (; end < text.length && depth; end++) {
      if (text[end] === '{') depth++;
      if (text[end] === '}') depth--;
    }
    assert.equal(depth, 0, 'Unbalanced nginx braces');
    result.push(text.slice(start, end - 1));
    re.lastIndex = end;
  }
  return result;
}

export function validateNginx(text, bootstrap = false) {
  const servers = blocks(text, '\\bserver');
  assert.equal(servers.length, bootstrap ? 2 : 4, 'Separate HTTP/HTTPS blocks required');
  for (const [domain, app] of Object.entries(mapping)) {
    const matching = servers.filter(s => s.match(/server_name\s+([^;]+);/)?.[1] === domain);
    assert.equal(matching.length, bootstrap ? 1 : 2, `Exact server_name required: ${domain}`);
    for (const server of matching) {
      assert.match(server, new RegExp(`add_header X-BloodInfo-App ${app} always;`));
      assert.doesNotMatch(server, /default_server|www\.|include\s/);
      const location = blocks(server, '\\blocation /');
      assert.equal(location.length, 1, 'One explicit root location');
      if (/listen 443 ssl;/.test(server)) {
        assert.match(server, new RegExp(`set \\$bloodinfo_app bloodinfo_${app}:80;`));
        assert.match(location[0], /proxy_pass http:\/\/\$bloodinfo_app;/);
        assert.match(server, /set \$bloodinfo_api bloodinfo_backend:5000;/);
        for (const prefix of ['/api/', '/socket.io/', '/uploads/']) {
          const routes = blocks(server, '\\blocation ' + prefix.replaceAll('.', '\\.'));
          assert.equal(routes.length, 1);
          assert.match(routes[0], /proxy_pass http:\/\/\$bloodinfo_api;/);
        }
        assert.match(server, /resolver 127\.0\.0\.11/);
        assert.match(server, /ssl_certificate \/etc\/letsencrypt\/live\/bloodinfo\/fullchain\.pem;/);
        assert.match(server, /ssl_certificate_key \/etc\/letsencrypt\/live\/bloodinfo\/privkey\.pem;/);
        assert.doesNotMatch(server, /return 30[1278]/, 'HTTPS must not redirect to the other app');
      } else {
        assert.match(server, /listen 80;/);
        assert.match(server, /root \/var\/www\/certbot;/);
        if (bootstrap) {
          assert.match(location[0], /return 503 /);
          assert.doesNotMatch(server, /proxy_pass|ssl_certificate/);
        } else {
          assert.ok(location[0].includes(`return 301 https://${domain}$request_uri;`));
        }
      }
    }
  }
}

export function validateCompose(config) {
  assert.equal(config.name, 'bloodinfo');
  const names = ['bloodinfo_admin', 'bloodinfo_backend', 'bloodinfo_frontend'];
  assert.deepEqual(Object.keys(config.services).sort(), names);
  for (const name of names) {
    const service = config.services[name];
    assert.equal(service.container_name, name);
    assert.ok(!('ports' in service), `${name} must publish ZERO host ports`);
    assert.ok(!('network_mode' in service));
    assert.equal(service.restart, 'unless-stopped');
    assert.deepEqual([...service.networks].sort(), ['bloodinfo_internal', 'goairclass_proxy']);
    assert.ok(service.healthcheck && service.mem_limit);
    assert.deepEqual(service.expose.map(String), [name.endsWith('backend') ? '5000' : '80']);
  }
  assert.equal(config.services.bloodinfo_frontend.build.context, './Frontend');
  assert.equal(config.services.bloodinfo_admin.build.context, './admin');
  assert.equal(config.services.bloodinfo_backend.build.context, './Backend');
  assert.equal(config.services.bloodinfo_backend.environment.PORT, '5000');
  assert.equal(config.services.bloodinfo_backend.environment.FRONTEND_URL, 'https://bloodinfo.in');
  assert.deepEqual(config.networks.goairclass_proxy, { name: 'goairclass_proxy', external: true });
  assert.equal(config.networks.bloodinfo_internal.name, 'bloodinfo_internal');
  assert.equal(config.networks.bloodinfo_internal.internal, true);
  for (const volume of Object.values(config.volumes)) assert.match(volume.name, /^bloodinfo_/);
}

export function checkAll() {
  validateCompose(yaml.load(read('docker-compose.yml')));
  assert.deepEqual(yaml.load(read('docker-compose.prod.yml')), { services: {} });
  validateNginx(read('nginx/conf.d/bloodinfo.conf'));
  validateNginx(read('nginx/bootstrap.conf'), true);
  for (const [folder, app] of [['Frontend', 'frontend'], ['admin', 'admin']]) {
    const docker = read(`${folder}/Dockerfile`);
    assert.match(docker, /COPY \. \./);
    assert.match(docker, /RUN npm run build/);
    assert.match(docker, /COPY --from=builder \/app\/dist \/usr\/share\/nginx\/html/);
    assert.doesNotMatch(docker, /COPY\s+(?:\.\.\/|.*(?:Frontend|admin)\/dist)/);
    assert.match(read(`${folder}/scripts/write-build-info.cjs`), new RegExp(`app: '${app}'`));
    assert.match(read(`${folder}/scripts/write-build-info.cjs`), /htmlSha256.*readFileSync/);
  }
  return 'Routing, isolated build contexts, zero host ports and shared-proxy contract passed';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(checkAll());
