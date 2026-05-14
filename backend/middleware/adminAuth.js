const { verifyAdminToken } = require('../utils/adminToken');

const getBearerToken = (headerValue) => {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = String(headerValue).split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const requireAdminAuth = (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    req.admin = verifyAdminToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
};

module.exports = { requireAdminAuth };
