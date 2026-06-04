const mongoose = require('mongoose');

const cloudinaryUrlValidator = {
  validator(value) {
    return /^https:\/\/res\.cloudinary\.com\/.+/i.test(value);
  },
  message: 'Image must be a Cloudinary URL',
};

const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true,
      maxlength: [120, 'Room type name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [600, 'Room type description cannot exceed 600 characters'],
    },
    priceRange: {
      type: String,
      trim: true,
      maxlength: [120, 'Room type price range cannot exceed 120 characters'],
    },
    maxGuests: {
      type: Number,
      min: [1, 'Room type max guests must be at least 1'],
      max: [50, 'Room type max guests cannot exceed 50'],
    },
  },
  { _id: false },
);

const featuredReviewSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
      maxlength: [120, 'Guest name cannot exceed 120 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Review rating must be at least 1'],
      max: [5, 'Review rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [800, 'Review comment cannot exceed 800 characters'],
    },
  },
  { _id: false },
);

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Accommodation title is required'],
      trim: true,
      minlength: [3, 'Accommodation title must be at least 3 characters'],
      maxlength: [160, 'Accommodation title cannot exceed 160 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Accommodation slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Accommodation slug must be lowercase words separated by hyphens',
      ],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      minlength: [10, 'Short description must be at least 10 characters'],
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
      minlength: [40, 'Full description must be at least 40 characters'],
      maxlength: [8000, 'Full description cannot exceed 8000 characters'],
    },
    heroImage: {
      type: String,
      required: [true, 'Hero image URL is required'],
      trim: true,
      validate: cloudinaryUrlValidator,
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
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Connected location is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [400, 'Address cannot exceed 400 characters'],
    },
    priceRange: {
      type: String,
      required: [true, 'Price range is required'],
      trim: true,
      maxlength: [120, 'Price range cannot exceed 120 characters'],
    },
    starRating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Star rating must be at least 1'],
      max: [5, 'Star rating cannot exceed 5'],
    },
    amenities: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [120, 'Amenity cannot exceed 120 characters'],
        },
      ],
      default: [],
    },
    roomTypes: {
      type: [roomTypeSchema],
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
    },
    nearbyAttractions: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Location',
        },
      ],
      default: [],
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [80, 'Contact number cannot exceed 80 characters'],
    },
    whatsappNumber: {
      type: String,
      trim: true,
      maxlength: [80, 'WhatsApp number cannot exceed 80 characters'],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [300, 'Website cannot exceed 300 characters'],
    },
    checkInTime: {
      type: String,
      trim: true,
      maxlength: [80, 'Check-in time cannot exceed 80 characters'],
    },
    checkOutTime: {
      type: String,
      trim: true,
      maxlength: [80, 'Check-out time cannot exceed 80 characters'],
    },
    policies: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [240, 'Policy cannot exceed 240 characters'],
        },
      ],
      default: [],
    },
    featuredReviews: {
      type: [featuredReviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Accommodation', accommodationSchema);
