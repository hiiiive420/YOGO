const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validate');

const nameValidation = body('name')
  .trim()
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ min: 2, max: 120 })
  .withMessage('Name must be between 2 and 120 characters');

const emailValidation = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail();

const passwordValidation = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters');

const setupKeyValidation = body('setupKey')
  .notEmpty()
  .withMessage('Setup key is required');

const tokenParamValidation = param('token')
  .trim()
  .notEmpty()
  .withMessage('Token is required')
  .isLength({ min: 32, max: 128 })
  .withMessage('Token is invalid');

const setupAdminValidation = [
  nameValidation,
  emailValidation,
  passwordValidation,
  setupKeyValidation,
  validateRequest,
];

const loginValidation = [emailValidation, passwordValidation, validateRequest];

const forgotPasswordValidation = [emailValidation, validateRequest];

const resetPasswordValidation = [
  tokenParamValidation,
  passwordValidation,
  validateRequest,
];

const verifyEmailValidation = [tokenParamValidation, validateRequest];

const resendVerificationValidation = [emailValidation, validateRequest];

module.exports = {
  forgotPasswordValidation,
  loginValidation,
  resendVerificationValidation,
  resetPasswordValidation,
  setupAdminValidation,
  verifyEmailValidation,
};
