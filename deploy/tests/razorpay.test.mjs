import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../preflight.mjs';
import { validateRazorpayConfig } from '../../Backend/config/razorpayMode.js';

// Synthetic values only. No connection to a database or payment API is made.
const fixture = {
  MONGO_URI: 'mongodb://fixture.invalid/bloodinfo_test', DB_NAME: 'bloodinfo_test',
  JWT_SECRET: 'ci-only-not-a-production-secret-32-characters',
  ADMIN_EMAIL: 'ci@example.invalid', ADMIN_PASSWORD: 'ci-only-fixture',
  SMTP_USER: 'ci@example.invalid', SMTP_PASS: 'ci-only-fixture',
  CLOUDINARY_CLOUD_NAME: 'ci-fixture', CLOUDINARY_API_KEY: 'ci-fixture', CLOUDINARY_API_SECRET: 'ci-fixture',
  GEMINI_API_KEY: 'ci-fixture', FRONTEND_URL: 'https://bloodinfo.in', PORT: '5000',
  RAZORPAY_MODE: 'test', RAZORPAY_KEY_ID: 'rzp_test_ci_fixture', RAZORPAY_KEY_SECRET: 'ci-only-fixture',
};
const environment = overrides => Object.entries({ ...fixture, ...overrides })
  .filter(([, value]) => value !== undefined).map(([key, value]) => `${key}=${value}`).join('\n');

for (const [mode, key, pass] of [
  ['test', 'rzp_test_ci_fixture', true],
  ['test', 'rzp_live_ci_fixture', false],
  ['live', 'rzp_live_ci_fixture', true],
  ['live', 'rzp_test_ci_fixture', false],
]) {
  test(`preflight and runtime: ${mode} mode + ${key.startsWith('rzp_test_') ? 'test' : 'live'} key => ${pass ? 'PASS' : 'FAIL'}`, () => {
    const overrides = { RAZORPAY_MODE: mode, RAZORPAY_KEY_ID: key };
    if (pass) {
      assert.equal(validateEnvironment(environment(overrides)), true);
      const env = Object.freeze({ ...fixture, ...overrides });
      assert.deepEqual(validateRazorpayConfig(env), { key_id: key, key_secret: fixture.RAZORPAY_KEY_SECRET });
    } else {
      assert.throws(() => validateEnvironment(environment(overrides)), /RAZORPAY_KEY_ID must match/);
      assert.throws(() => validateRazorpayConfig({ ...fixture, ...overrides }), /RAZORPAY_KEY_ID must match/);
    }
  });
}

for (const mode of [undefined, '', 'sandbox', 'TEST']) {
  test(`reject ${mode === undefined ? 'missing' : JSON.stringify(mode)} RAZORPAY_MODE`, () => {
    assert.throws(() => validateEnvironment(environment({ RAZORPAY_MODE: mode })), /RAZORPAY_MODE/);
    assert.throws(() => validateRazorpayConfig({ ...fixture, RAZORPAY_MODE: mode }), /RAZORPAY_MODE/);
  });
}
for (const name of ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) {
  for (const value of [undefined, '', '   ']) {
    test(`reject ${name} when ${value === undefined ? 'missing' : value === '' ? 'empty' : 'whitespace-only'}`, () => {
      assert.throws(() => validateEnvironment(environment({ [name]: value })), new RegExp(name));
      assert.throws(() => validateRazorpayConfig({ ...fixture, [name]: value }), new RegExp(name));
    });
  }
}
test('test credentials stay unchanged, including the secret passed to Razorpay', () => {
  const env = Object.freeze({ ...fixture, RAZORPAY_KEY_SECRET: ' ci-fixture-secret ' });
  assert.deepEqual(validateRazorpayConfig(env), { key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
});
test('test mode still rejects invalid Mongo URI and weak JWT secrets', () => {
  assert.throws(() => validateEnvironment(environment({ MONGO_URI: 'postgres://fixture.invalid' })));
  assert.throws(() => validateEnvironment(environment({ JWT_SECRET: 'too-short' })), /JWT_SECRET/);
});
