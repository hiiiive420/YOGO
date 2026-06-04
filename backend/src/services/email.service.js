const nodemailer = require('nodemailer');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getRequiredMailConfig() {
  const requiredKeys = ['SMTP_HOST', 'SMTP_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    const error = new Error(`Missing email config: ${missingKeys.join(', ')}`);
    error.statusCode = 500;
    throw error;
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
}

function createTransporter() {
  const config = getRequiredMailConfig();

  console.info('SMTP configuration loaded', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
  });

  return nodemailer.createTransport(config);
}

async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });

    console.info('Email send success', {
      messageId: info.messageId,
      to,
    });

    return info;
  } catch (error) {
    console.error('Email send failure:', error.message);
    throw error;
  }
}

async function sendInquiryNotification(inquiry) {
  const recipient = process.env.MAIL_TO;

  if (!recipient) {
    const error = new Error('Missing MAIL_TO contact recipient email');
    error.statusCode = 500;
    throw error;
  }

  await sendMail({
    to: recipient,
    subject: 'New Inquiry - YOGO Travels',
    text: [
      'New Inquiry Received',
      '',
      'Customer:',
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || '-'}`,
      '',
      'Inquiry Context:',
      `Type: ${inquiry.inquiryType || 'General'}`,
      `Selected Item: ${inquiry.selectedItemTitle || inquiry.selectedTourPackage || '-'}`,
      `Theme: ${inquiry.relatedTheme || '-'}`,
      `Location: ${inquiry.relatedLocation || '-'}`,
      `Selected Place: ${inquiry.selectedPlace || '-'}`,
      `Total Days: ${inquiry.totalDays || '-'}`,
      '',
      `Message: ${inquiry.message}`,
      `Submitted At: ${inquiry.createdAt?.toISOString?.() || new Date().toISOString()}`,
      '',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Inquiry Received</h2>
        <h3>Customer</h3>
        <p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(inquiry.phone || '-')}</p>
        <h3>Inquiry Context</h3>
        <p><strong>Type:</strong> ${escapeHtml(inquiry.inquiryType || 'General')}</p>
        <p><strong>Selected Item:</strong> ${escapeHtml(
          inquiry.selectedItemTitle || inquiry.selectedTourPackage || '-',
        )}</p>
        <p><strong>Theme:</strong> ${escapeHtml(inquiry.relatedTheme || '-')}</p>
        <p><strong>Location:</strong> ${escapeHtml(inquiry.relatedLocation || '-')}</p>
        <p><strong>Selected Place:</strong> ${escapeHtml(inquiry.selectedPlace || '-')}</p>
        <p><strong>Total Days:</strong> ${escapeHtml(inquiry.totalDays || '-')}</p>
        <p><strong>Message:</strong><br />${escapeHtml(inquiry.message).replace(/\n/g, '<br />')}</p>
        <p><strong>Submitted At:</strong> ${escapeHtml(
          inquiry.createdAt?.toISOString?.() || new Date().toISOString(),
        )}</p>
      </div>
    `,
  });
}

async function sendTestEmail() {
  if (!process.env.MAIL_TO) {
    const error = new Error('Missing MAIL_TO test email recipient');
    error.statusCode = 500;
    throw error;
  }

  await sendMail({
    to: process.env.MAIL_TO,
    subject: 'YOGO Travels SMTP Test',
    text: 'This is a YOGO Travels SMTP test email.',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>YOGO Travels SMTP Test</h2>
        <p>This test email confirms the backend SMTP configuration is working.</p>
      </div>
    `,
  });
}

function getApiBaseUrl() {
  return process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
}

function getAdminFrontendUrl() {
  return process.env.ADMIN_FRONTEND_URL || 'http://localhost:5173';
}

async function sendVerificationEmail(admin, token) {
  const verifyUrl = `${getApiBaseUrl()}/api/admin/auth/verify-email/${token}`;

  await sendMail({
    to: admin.email,
    subject: 'Verify your YOGO admin email',
    text: `Verify your admin email using this link: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your YOGO admin email</h2>
        <p>Hello ${admin.name},</p>
        <p>Please verify your email address to activate admin access.</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#050505;color:#ffffff;text-decoration:none;border-radius:4px;">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(admin, token) {
  const resetUrl = `${getAdminFrontendUrl()}/admin/reset-password?token=${token}`;

  await sendMail({
    to: admin.email,
    subject: 'Reset your YOGO admin password',
    text: `Reset your admin password using this link: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your YOGO admin password</h2>
        <p>Hello ${admin.name},</p>
        <p>Use the secure link below to reset your admin password.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#050505;color:#ffffff;text-decoration:none;border-radius:4px;">Reset password</a></p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendInquiryNotification,
  sendMail,
  sendPasswordResetEmail,
  sendTestEmail,
  sendVerificationEmail,
};
