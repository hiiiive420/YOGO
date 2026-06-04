const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema(
  {
    itineraryPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItineraryPlan',
      required: [true, 'Itinerary plan is required'],
    },
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
      required: [true, 'Day title is required'],
      trim: true,
      minlength: [2, 'Day title must be at least 2 characters'],
      maxlength: [140, 'Day title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Day description is required'],
      trim: true,
      minlength: [10, 'Day description must be at least 10 characters'],
      maxlength: [2500, 'Day description cannot exceed 2500 characters'],
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
    activities: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [180, 'Activity cannot exceed 180 characters'],
        },
      ],
      default: [],
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'At least one activity is required',
      },
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
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'At least one instruction is required',
      },
    },
    travelTime: {
      type: String,
      required: [true, 'Travel time is required'],
      trim: true,
      minlength: [2, 'Travel time must be at least 2 characters'],
      maxlength: [120, 'Travel time cannot exceed 120 characters'],
    },
    selectedLocations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Location',
        },
      ],
      default: [],
      validate: {
        validator(items) {
          return items.length > 0;
        },
        message: 'At least one selected location is required',
      },
    },
  },
  {
    timestamps: true,
  },
);

itineraryDaySchema.index({ itineraryPlanId: 1, dayNumber: 1 }, { unique: true });

module.exports = mongoose.model('ItineraryDay', itineraryDaySchema);
