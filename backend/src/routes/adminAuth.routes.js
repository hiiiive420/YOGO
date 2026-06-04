const express = require('express');
const {
  forgotPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  resendVerificationEmail,
  resetPassword,
  setupFirstAdmin,
  verifyEmail,
} = require('../controllers/adminAuth.controller');
const {
  authenticateAdmin,
  requireVerifiedAdmin,
} = require('../middleware/auth');
const {
  forgotPasswordValidation,
  loginValidation,
  resendVerificationValidation,
  resetPasswordValidation,
  setupAdminValidation,
  verifyEmailValidation,
} = require('../validations/adminAuth.validation');

const router = express.Router();

router.post('/setup', setupAdminValidation, setupFirstAdmin);
router.post('/login', loginValidation, loginAdmin);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, resetPassword);
router.get('/verify-email/:token', verifyEmailValidation, verifyEmail);
router.post(
  '/resend-verification',
  resendVerificationValidation,
  resendVerificationEmail,
);
router.get('/me', authenticateAdmin, requireVerifiedAdmin, getCurrentAdmin);
router.post('/logout', authenticateAdmin, logoutAdmin);

module.exports = router;
