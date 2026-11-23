import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const manifests = [];
for (const [folder, app] of [['Frontend', 'frontend'], ['admin', 'admin'], ['hospital', 'hospital']]) {
  const manifest = JSON.parse(readFileSync(`${folder}/dist/bloodinfo-build.json`, 'utf8'));
  assert.equal(manifest.app, app);
  assert.equal(manifest.htmlSha256, createHash('sha256').update(readFileSync(`${folder}/dist/index.html`)).digest('hex'));
  manifests.push(manifest);
}
const htmls = new Set(manifests.map(m => m.htmlSha256));
const builds = new Set(manifests.map(m => m.buildSha256));
assert.equal(htmls.size, manifests.length, 'Apps serve identical HTML');
assert.equal(builds.size, manifests.length, 'Apps use identical builds');
console.log('Frontend, admin and hospital HTML/build fingerprints differ');
