const jwt = require('jsonwebtoken');

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return process.env.JWT_SECRET;
}

function signAdminToken(admin) {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  );
}

function verifyAdminToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
};
