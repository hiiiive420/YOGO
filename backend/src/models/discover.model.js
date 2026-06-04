const mongoose = require('mongoose');

const cloudinaryUrlValidator = {
  validator(value) {
    return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
  },
  message: 'Image must be a Cloudinary URL',
};

const discoverSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Discover title is required'],
      trim: true,
      minlength: [3, 'Discover title must be at least 3 characters'],
      maxlength: [140, 'Discover title cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Discover slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Discover slug must be lowercase words separated by hyphens',
      ],
    },
    heroImage: {
      type: String,
      required: [true, 'Hero image URL is required'],
      trim: true,
      validate: cloudinaryUrlValidator,
    },
    description: {
      type: String,
      required: [true, 'Discover description is required'],
      trim: true,
      minlength: [40, 'Discover description must be at least 40 characters'],
      maxlength: [8000, 'Discover description cannot exceed 8000 characters'],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Connected location is required'],
    },
    gallery: {
      type: [
        {
          type: String,
          trim: true,
          validate: cloudinaryUrlValidator,
        },
      ],
      default: [],
    },
    highlights: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [180, 'Highlight cannot exceed 180 characters'],
        },
      ],
      default: [],
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'At least one highlight is required',
      },
    },
    travelTips: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [240, 'Travel tip cannot exceed 240 characters'],
        },
      ],
      default: [],
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'At least one travel tip is required',
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Discover', discoverSchema);
