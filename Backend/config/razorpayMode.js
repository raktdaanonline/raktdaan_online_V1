import assert from 'node:assert/strict';

// Shared by deployment preflight and SDK initialization. Never infer a mode.
export function validateRazorpayConfig(env) {
  const { RAZORPAY_MODE: mode, RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: secret } = env;
  assert.ok(mode === 'test' || mode === 'live', 'RAZORPAY_MODE must be explicitly set to test or live');
  assert.ok(typeof keyId === 'string' && keyId.startsWith(`rzp_${mode}_`), `RAZORPAY_KEY_ID must match RAZORPAY_MODE=${mode}`);
  assert.ok(typeof secret === 'string' && secret.trim().length > 0, 'RAZORPAY_KEY_SECRET is required');
  // Razorpay selects its environment from the credentials. Pass them unchanged.
  return { key_id: keyId, key_secret: secret };
}
