import assert from 'node:assert/strict';
import { X509Certificate, createPrivateKey, createPublicKey } from 'node:crypto';
import { readFileSync } from 'node:fs';
const cert = new X509Certificate(readFileSync('/certs/live/bloodinfo/fullchain.pem'));
const expectedSANs = ['DNS:admin.bloodinfo.in', 'DNS:bloodinfo.in', 'DNS:hospital.bloodinfo.in'];
const sans = (cert.subjectAltName || '').split(', ').sort();
const key = createPrivateKey(readFileSync('/certs/live/bloodinfo/privkey.pem'));
assert.equal(createPublicKey(key).export({ type: 'spki', format: 'pem' }), cert.publicKey.export({ type: 'spki', format: 'pem' }));
const coversAll = expectedSANs.every(d => sans.includes(d));
if (!coversAll) {
  console.log('expand');
} else if (Date.parse(cert.validTo) < Date.now() + 30 * 86400000) {
  console.log('renew');
} else {
  console.log('valid');
}
