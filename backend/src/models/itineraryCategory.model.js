const mongoose = require('mongoose');

const itineraryCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Itinerary category title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Itinerary category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase words separated by hyphens',
      ],
    },
    thumbnailImage: {
      type: String,
      required: [true, 'Thumbnail image URL is required'],
      trim: true,
      validate: {
        validator(value) {
          return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
        },
        message: 'Thumbnail image must be a Cloudinary URL',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('ItineraryCategory', itineraryCategorySchema);
