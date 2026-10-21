import assert from 'node:assert/strict';
import { X509Certificate, createPrivateKey, createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';
const cert = new X509Certificate(readFileSync('/certs/live/bloodinfo/fullchain.pem'));
assert.deepEqual(cert.subjectAltName.split(', ').sort(), ['DNS:admin.bloodinfo.in', 'DNS:bloodinfo.in']);
const key = createPrivateKey(readFileSync('/certs/live/bloodinfo/privkey.pem'));
assert.equal(createPublicKey(key).export({ type: 'spki', format: 'pem' }), cert.publicKey.export({ type: 'spki', format: 'pem' }));
console.log(Date.parse(cert.validTo) < Date.now() + 30 * 86400000 ? 'renew' : 'valid');
