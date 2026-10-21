import assert from 'node:assert/strict';
import { resolve4, resolve6 } from 'node:dns/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function validateDns(records, ipv6 = []) {
  assert.deepEqual([...new Set(records)].sort(), ['200.234.45.233'], 'DNS A records must resolve only to 200.234.45.233');
  assert.equal(ipv6.length, 0, 'Remove AAAA records until an IPv6 target is explicitly configured');
}
export function validateEnvironment(text) {
  const values = Object.fromEntries(text.split(/\r?\n/).filter(l => /^\s*[A-Z][A-Z0-9_]*=/.test(l)).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')];
  }));
  const required = ['MONGO_URI', 'DB_NAME', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SMTP_USER', 'SMTP_PASS',
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'GEMINI_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missing = required.filter(k => !values[k] || /^(your|change|replace|<)/i.test(values[k]));
  assert.equal(missing.length, 0, `Missing/placeholder production values: ${missing.join(', ')}`);
  assert.ok(values.JWT_SECRET.length >= 32, 'JWT_SECRET must be an existing strong secret (at least 32 characters)');
  assert.match(values.MONGO_URI, /^mongodb(?:\+srv)?:\/\//);
  if (values.FRONTEND_URL) assert.equal(values.FRONTEND_URL, 'https://bloodinfo.in');
  if (values.PORT) assert.equal(values.PORT, '5000');
  assert.doesNotMatch(values.RAZORPAY_KEY_ID, /^rzp_test_/, 'Configure live payment credentials before production');
  return true;
}

export async function preflight() {
  for (const domain of ['bloodinfo.in', 'admin.bloodinfo.in']) {
    const ipv6 = await resolve6(domain).catch(e => { if (['ENODATA', 'ENOTFOUND'].includes(e.code)) return []; throw e; });
    validateDns(await resolve4(domain), ipv6);
  }
  validateEnvironment(readFileSync('/run/bloodinfo.env', 'utf8'));
  // Fail if a second config owns these domains. Never edit that config.
  for (const file of readdirSync('/central')) {
    if (!file.endsWith('.conf') || file === 'bloodinfo.conf') continue;
    const text = readFileSync(`/central/${file}`, 'utf8').replace(/#[^\n]*/g, '');
    for (const match of text.matchAll(/server_name\s+([^;]+);/g)) {
      assert.ok(!match[1].split(/\s+/).some(d => ['bloodinfo.in', 'admin.bloodinfo.in'].includes(d)), `Domain already owned by ${file}; review manually`);
    }
  }
  console.log('DNS, production environment and exclusive domain ownership passed');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await preflight();
