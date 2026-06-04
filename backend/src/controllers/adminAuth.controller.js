const Admin = require('../models/admin.model');
const asyncHandler = require('../utils/asyncHandler');
const hashToken = require('../utils/hashToken');
const { signAdminToken } = require('../utils/jwt');
const {
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require('../services/email.service');

function sendAuthResponse(res, statusCode, message, admin) {
  const token = signAdminToken(admin);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: admin,
  });
}

function requireSetupKey(setupKey) {
  if (!process.env.ADMIN_SETUP_KEY) {
    const error = new Error('ADMIN_SETUP_KEY is required');
    error.statusCode = 500;
    throw error;
  }

  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    const error = new Error('Invalid admin setup key');
    error.statusCode = 403;
    throw error;
  }
}

const setupFirstAdmin = asyncHandler(async (req, res) => {
  requireSetupKey(req.body.setupKey);

  const existingAdmins = await Admin.countDocuments();

  if (existingAdmins > 0) {
    res.status(409).json({
      success: false,
      message: 'Admin setup is already completed',
    });
    return;
  }

  const admin = new Admin({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 'super-admin',
  });

  const verificationToken = admin.createEmailVerificationToken();
  await admin.save();
  await sendVerificationEmail(admin, verificationToken);

  res.status(201).json({
    success: true,
    message: 'Admin created. Please verify the email address before login.',
    data: admin,
  });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email }).select('+password');
  const isValidPassword = admin
    ? await admin.comparePassword(req.body.password)
    : false;

  if (!admin || !isValidPassword) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  if (!admin.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'Please verify your email before logging in',
    });
    return;
  }

  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  sendAuthResponse(res, 200, 'Login successful', admin);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });

  if (admin) {
    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(admin, resetToken);
    } catch (error) {
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save({ validateBeforeSave: false });
      throw error;
    }
  }

  res.status(200).json({
    success: true,
    message: 'If an admin account exists, a password reset email has been sent.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = hashToken(req.params.token);
  const admin = await Admin.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!admin) {
    res.status(400).json({
      success: false,
      message: 'Password reset token is invalid or expired',
    });
    return;
  }

  admin.password = req.body.password;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  if (!admin.isEmailVerified) {
    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please verify your email before login.',
    });
    return;
  }

  sendAuthResponse(res, 200, 'Password reset successful', admin);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = hashToken(req.params.token);
  const admin = await Admin.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!admin) {
    res.status(400).json({
      success: false,
      message: 'Email verification token is invalid or expired',
    });
    return;
  }

  admin.isEmailVerified = true;
  admin.emailVerificationToken = undefined;
  admin.emailVerificationExpires = undefined;
  await admin.save({ validateBeforeSave: false });

  sendAuthResponse(res, 200, 'Email verified successfully', admin);
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });

  if (admin && !admin.isEmailVerified) {
    const verificationToken = admin.createEmailVerificationToken();
    await admin.save({ validateBeforeSave: false });
    await sendVerificationEmail(admin, verificationToken);
  }

  res.status(200).json({
    success: true,
    message: 'If verification is needed, a new email has been sent.',
  });
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.admin,
  });
});

const logoutAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

module.exports = {
  forgotPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  resendVerificationEmail,
  resetPassword,
  setupFirstAdmin,
  verifyEmail,
};
