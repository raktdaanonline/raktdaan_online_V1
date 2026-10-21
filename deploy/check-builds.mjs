import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const manifests = [];
for (const [folder, app] of [['Frontend', 'frontend'], ['admin', 'admin']]) {
  const manifest = JSON.parse(readFileSync(`${folder}/dist/bloodinfo-build.json`, 'utf8'));
  assert.equal(manifest.app, app);
  assert.equal(manifest.htmlSha256, createHash('sha256').update(readFileSync(`${folder}/dist/index.html`)).digest('hex'));
  manifests.push(manifest);
}
assert.notEqual(manifests[0].htmlSha256, manifests[1].htmlSha256, 'Apps serve identical HTML');
assert.notEqual(manifests[0].buildSha256, manifests[1].buildSha256, 'Apps use identical builds');
console.log('Frontend and admin HTML/build fingerprints differ');
