const mongoose = require('mongoose');

const cloudinaryUrlValidator = {
  validator(value) {
    return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
  },
  message: 'Image must be a Cloudinary URL',
};

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [3, 'Blog title must be at least 3 characters'],
      maxlength: [160, 'Blog title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Blog slug must be lowercase words separated by hyphens',
      ],
    },
    featuredImage: {
      type: String,
      required: [true, 'Featured image URL is required'],
      trim: true,
      validate: cloudinaryUrlValidator,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      trim: true,
      minlength: [50, 'Blog content must be at least 50 characters'],
      maxlength: [50000, 'Blog content cannot exceed 50000 characters'],
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [180, 'SEO title cannot exceed 180 characters'],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [320, 'SEO description cannot exceed 320 characters'],
    },
    relatedLocations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Location',
        },
      ],
      default: [],
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Blog', blogSchema);
