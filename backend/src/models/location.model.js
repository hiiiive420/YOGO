const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      minlength: [2, 'Location name must be at least 2 characters'],
      maxlength: [120, 'Location name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Location slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Location slug must be lowercase words separated by hyphens',
      ],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude cannot be less than -90'],
      max: [90, 'Latitude cannot be greater than 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude cannot be less than -180'],
      max: [180, 'Longitude cannot be greater than 180'],
    },
    image: {
      type: String,
      required: [true, 'Cloudinary image URL is required'],
      trim: true,
      validate: {
        validator(value) {
          return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
        },
        message: 'Image must be a Cloudinary URL',
      },
    },
    gallery: {
      type: [
        {
          type: String,
          trim: true,
          validate: {
            validator(value) {
              return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
            },
            message: 'Gallery image must be a Cloudinary URL',
          },
        },
      ],
      default: [],
    },
    isTopLocation: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, 'Location description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Location', locationSchema);
