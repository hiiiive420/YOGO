const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      minlength: [2, 'Admin name must be at least 2 characters'],
      maxlength: [120, 'Admin name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Admin password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'super-admin'],
      default: 'admin',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.createEmailVerificationToken =
  function createEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    return token;
  };

adminSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return token;
};

adminSchema.methods.toJSON = function toJSON() {
  const admin = this.toObject();

  delete admin.password;
  delete admin.emailVerificationToken;
  delete admin.emailVerificationExpires;
  delete admin.passwordResetToken;
  delete admin.passwordResetExpires;

  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
