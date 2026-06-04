const Admin = require('../models/admin.model');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAdminToken } = require('../utils/jwt');

const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({
      success: false,
      message: 'Admin authentication required',
    });
    return;
  }

  const decoded = verifyAdminToken(token);
  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    res.status(401).json({
      success: false,
      message: 'Invalid admin token',
    });
    return;
  }

  req.admin = admin;
  next();
});

function requireVerifiedAdmin(req, res, next) {
  if (!req.admin?.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'Admin email verification required',
    });
    return;
  }

  next();
}

module.exports = {
  authenticateAdmin,
  requireVerifiedAdmin,
};
