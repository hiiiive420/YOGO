const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [160, 'Email cannot exceed 160 characters'],
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    inquiryType: {
      type: String,
      trim: true,
      maxlength: [80, 'Inquiry type cannot exceed 80 characters'],
      default: 'General',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [80, 'Phone cannot exceed 80 characters'],
    },
    selectedTourPackage: {
      type: String,
      trim: true,
      maxlength: [180, 'Selected tour/package cannot exceed 180 characters'],
    },
    selectedItemTitle: {
      type: String,
      trim: true,
      maxlength: [180, 'Selected item title cannot exceed 180 characters'],
    },
    selectedItemSlug: {
      type: String,
      trim: true,
      maxlength: [180, 'Selected item slug cannot exceed 180 characters'],
    },
    selectedPlace: {
      type: String,
      trim: true,
      maxlength: [180, 'Selected place cannot exceed 180 characters'],
    },
    relatedTheme: {
      type: String,
      trim: true,
      maxlength: [180, 'Related theme cannot exceed 180 characters'],
    },
    relatedLocation: {
      type: String,
      trim: true,
      maxlength: [180, 'Related location cannot exceed 180 characters'],
    },
    sourcePage: {
      type: String,
      trim: true,
      maxlength: [240, 'Source page cannot exceed 240 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
    totalDays: {
      type: Number,
      min: [0, 'Total days cannot be negative'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Inquiry', inquirySchema);
