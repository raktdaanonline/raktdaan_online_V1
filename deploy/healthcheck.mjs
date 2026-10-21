import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export function request(url, { ip, method = 'GET' } = {}) {
  return new Promise((resolve, reject) => {
    const options = { method, timeout: 15000, headers: { 'Cache-Control': 'no-cache' } };
    if (ip) options.lookup = (_host, opts, cb) => opts.all ? cb(null, [{ address: ip, family: 4 }]) : cb(null, ip, 4);
    const req = (url.startsWith('https:') ? https : http).request(url, options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Health request timed out')));
    req.end();
  });
}
export function validateApp({ app, commit, head, html, info, api, redirect, expected }) {
  const domain = app === 'frontend' ? 'bloodinfo.in' : 'admin.bloodinfo.in';
  for (const response of [head, html, info]) {
    assert.equal(response.status, 200, `${domain} must serve directly without redirects`);
    assert.equal(response.headers['x-bloodinfo-app'], app, `${domain}: wrong app header`);
    assert.ok(!response.headers.location, 'No cross-domain redirect');
  }
  const manifest = JSON.parse(info.body);
  assert.equal(manifest.app, app, `${domain}: wrong build manifest`);
  assert.equal(manifest.commit, commit, `${domain}: stale/wrong release`);
  assert.equal(manifest.htmlSha256, createHash('sha256').update(html.body).digest('hex'), 'Served HTML differs from manifest');
  assert.match(manifest.buildSha256, /^[a-f0-9]{64}$/);
  if (expected) assert.deepEqual(manifest, expected, 'Gateway differs from the independently inspected container');
  assert.equal(api.status, 200);
  assert.deepEqual(JSON.parse(api.body), { app: 'bloodinfo_backend', ready: true });
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.location, `https://${domain}/`, 'HTTP redirect must keep the same domain');
  return manifest;
}
export async function checkLive({ commit, ip, expectedDir } = {}) {
  assert.match(commit || '', /^[a-f0-9]{40}$/, 'Expected exact release commit');
  const manifests = [];
  for (const [domain, app] of [['bloodinfo.in', 'frontend'], ['admin.bloodinfo.in', 'admin']]) {
    const base = `https://${domain}`;
    const options = { ip };
    const [head, html, info, api, redirect] = await Promise.all([
      request(`${base}/`, { ...options, method: 'HEAD' }), request(`${base}/`, options),
      request(`${base}/bloodinfo-build.json`, options), request(`${base}/api/healthz`, options),
      request(`http://${domain}/`, { ...options, method: 'HEAD' })
    ]);
    const expected = expectedDir ? JSON.parse(readFileSync(`${expectedDir}/${app}.json`, 'utf8')) : undefined;
    manifests.push(validateApp({ app, commit, head, html, info, api, redirect, expected }));
    console.log(`${domain}: header=${app}, exact release and API readiness passed`);
  }
  assertSeparateBuilds(manifests);
}
export function assertSeparateBuilds(manifests) {
  assert.notEqual(manifests[0].htmlSha256, manifests[1].htmlSha256, 'Both domains serve the same HTML');
  assert.notEqual(manifests[0].buildSha256, manifests[1].buildSha256, 'Both domains serve the same build');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const get = key => args.includes(key) ? args[args.indexOf(key) + 1] : undefined;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await checkLive({ commit: get('--commit'), ip: get('--ip'), expectedDir: get('--expected-dir') });
      break;
    } catch (error) {
      if (attempt === 5) throw error;
      console.error(`Routing check attempt ${attempt} failed: ${error.message}`);
      await delay(2000);
    }
  }
}
