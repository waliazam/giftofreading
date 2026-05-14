const crypto = require('crypto');

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'gift-of-reading-admin-secret';
const ADMIN_TOKEN_TTL_SECONDS = parseInt(process.env.ADMIN_TOKEN_TTL_SECONDS || '43200', 10);

const base64UrlEncode = (value) => Buffer.from(value)
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '');

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(padded, 'base64').toString();
};

const signToken = (payload) => crypto
  .createHmac('sha256', ADMIN_TOKEN_SECRET)
  .update(payload)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/g, '');

const createAdminToken = (admin) => {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_TOKEN_TTL_SECONDS;
  const payload = {
    adminId: admin.id,
    username: admin.username,
    exp
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signToken(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = (token) => {
  const [encodedPayload, signature] = String(token || '').split('.');

  if (!encodedPayload || !signature) {
    throw new Error('Invalid admin token format');
  }

  const expectedSignature = signToken(encodedPayload);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new Error('Invalid admin token signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Admin token expired');
  }

  return payload;
};

module.exports = { createAdminToken, verifyAdminToken };
