const Inquiry = require('../models/inquiry.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendInquiryNotification } = require('../services/email.service');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildInquiryPayload(body) {
  const selectedItemTitle = trimString(
    body.selectedItemTitle ||
      body.packageTitle ||
      body.dayTourTitle ||
      body.accommodationTitle ||
      body.destinationTitle ||
      body.selectedTourPackage ||
      body.selectedTour ||
      body.package,
  );
  const totalDays =
    body.totalDays === undefined || body.totalDays === ''
      ? undefined
      : Number(body.totalDays);

  return {
    email: trimString(body.email).toLowerCase(),
    inquiryType: trimString(body.inquiryType) || 'General',
    message: trimString(body.message),
    name: trimString(body.name),
    phone: trimString(body.phone),
    relatedLocation: trimString(body.relatedLocation || body.location),
    relatedTheme: trimString(body.relatedTheme || body.theme || body.selectedTheme),
    selectedItemSlug: trimString(
      body.selectedItemSlug ||
        body.packageSlug ||
        body.dayTourSlug ||
        body.accommodationSlug ||
        body.destinationSlug,
    ),
    selectedItemTitle,
    selectedPlace: trimString(body.selectedPlace),
    selectedTourPackage: selectedItemTitle,
    sourcePage: trimString(body.sourcePage),
    totalDays: Number.isFinite(totalDays) ? totalDays : undefined,
  };
}

function validateInquiryPayload(payload) {
  const errors = {};

  if (!payload.name) errors.name = 'Name is required';
  if (!payload.email) {
    errors.email = 'Email is required';
  } else if (!emailPattern.test(payload.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!payload.phone) errors.phone = 'Phone is required';
  if (!payload.message) {
    errors.message = 'Message is required';
  } else if (payload.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
}

const createInquiry = asyncHandler(async (req, res) => {
  const payload = buildInquiryPayload(req.body);
  const errors = validateInquiryPayload(payload);

  if (Object.keys(errors).length > 0) {
    res.status(422).json({
      success: false,
      message: 'Please check the contact form fields',
      errors,
    });
    return;
  }

  const inquiry = await Inquiry.create(payload);

  try {
    await sendInquiryNotification(inquiry);
    inquiry.emailSent = true;
    await inquiry.save();
  } catch (error) {
    console.error('Inquiry email notification failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Inquiry saved, but email notification failed',
      error: error.message,
      data: inquiry,
    });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Inquiry sent successfully',
    data: inquiry,
  });
});

const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: inquiries.length,
    data: inquiries,
  });
});

module.exports = {
  createInquiry,
  getInquiries,
};
