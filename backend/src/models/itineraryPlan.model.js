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

const packageDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: [true, 'Day number is required'],
      min: [1, 'Day number must be at least 1'],
      max: [365, 'Day number cannot exceed 365'],
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: 'Day number must be a whole number',
      },
    },
    title: {
      type: String,
      trim: true,
      maxlength: [140, 'Day title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2500, 'Day description cannot exceed 2500 characters'],
    },
    heroImage: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return !value || /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
        },
        message: 'Day hero image must be a Cloudinary URL',
      },
    },
    travelTime: {
      type: String,
      trim: true,
      maxlength: [120, 'Travel time cannot exceed 120 characters'],
    },
    activities: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [180, 'Activity cannot exceed 180 characters'],
        },
      ],
      default: [],
    },
    instructions: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [240, 'Instruction cannot exceed 240 characters'],
        },
      ],
      default: [],
    },
    locations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Location',
        },
      ],
      default: [],
    },
  },
  { _id: true },
);

const itineraryPlanSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItineraryCategory',
      required: [true, 'Itinerary category is required'],
    },
    title: {
      type: String,
      required: [true, 'Itinerary plan title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Itinerary plan slug is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase words separated by hyphens',
      ],
    },
    heroImage: {
      type: String,
      required: [true, 'Hero image URL is required'],
      trim: true,
      validate: {
        validator(value) {
          return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
        },
        message: 'Hero image must be a Cloudinary URL',
      },
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      minlength: [10, 'Short description must be at least 10 characters'],
      maxlength: [600, 'Short description cannot exceed 600 characters'],
    },
    fullDescription: {
      type: String,
      trim: true,
      maxlength: [6000, 'Full description cannot exceed 6000 characters'],
      default: '',
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days is required'],
      min: [1, 'Total days must be at least 1'],
      max: [365, 'Total days cannot exceed 365'],
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: 'Total days must be a whole number',
      },
    },
    contactCtaText: {
      type: String,
      trim: true,
      maxlength: [80, 'Contact CTA text cannot exceed 80 characters'],
      default: 'Contact',
    },
    isTopActivityPackage: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    days: {
      type: [packageDaySchema],
      default: [],
    },
    faqs: {
      type: [faqSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

itineraryPlanSchema.index({ categoryId: 1, slug: 1 }, { unique: true });
itineraryPlanSchema.index({ isTopActivityPackage: -1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ItineraryPlan', itineraryPlanSchema);
