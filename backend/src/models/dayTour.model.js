const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      trim: true,
      maxlength: [240, 'FAQ question cannot exceed 240 characters'],
    },
    answer: {
      type: String,
      trim: true,
      maxlength: [1500, 'FAQ answer cannot exceed 1500 characters'],
    },
  },
  { _id: false },
);

const dayTourPlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [140, 'Place name cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Place slug must be lowercase words separated by hyphens',
      ],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return !value || /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
        },
        message: 'Place image must be a Cloudinary URL',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2500, 'Place description cannot exceed 2500 characters'],
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude cannot be less than -90'],
      max: [90, 'Latitude cannot be greater than 90'],
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude cannot be less than -180'],
      max: [180, 'Longitude cannot be greater than 180'],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    sourceLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
  },
  { _id: true },
);

const dayTourSchema = new mongoose.Schema(
  {
    mainLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Main location is required'],
    },
    title: {
      type: String,
      required: [true, 'Day tour title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [160, 'Title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Day tour slug is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase words separated by hyphens',
      ],
    },
    heroImage: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return !value || /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
        },
        message: 'Hero image must be a Cloudinary URL',
      },
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      minlength: [10, 'Short description must be at least 10 characters'],
      maxlength: [800, 'Short description cannot exceed 800 characters'],
    },
    fullDescription: {
      type: String,
      trim: true,
      maxlength: [6000, 'Full description cannot exceed 6000 characters'],
      default: '',
    },
    places: {
      type: [dayTourPlaceSchema],
      default: [],
    },
    faqs: {
      type: [faqSchema],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTopDayTour: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  },
);

dayTourSchema.index({ mainLocation: 1, slug: 1 }, { unique: true });
dayTourSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
dayTourSchema.index({ isTopDayTour: -1, status: 1, createdAt: -1 });

module.exports = mongoose.model('DayTour', dayTourSchema);
