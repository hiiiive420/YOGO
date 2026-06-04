const mongoose = require('mongoose');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { parseArrayField } = require('../utils/arrayFields');

const dayIdValidation = param('id')
  .isMongoId()
  .withMessage('Invalid itinerary day id');

const planIdBodyValidation = body('itineraryPlanId')
  .notEmpty()
  .withMessage('Itinerary plan id is required')
  .isMongoId()
  .withMessage('Itinerary plan id must be valid');

const optionalPlanIdBodyValidation = body('itineraryPlanId')
  .optional()
  .isMongoId()
  .withMessage('Itinerary plan id must be valid');

const planIdQueryValidation = query('itineraryPlanId')
  .optional()
  .isMongoId()
  .withMessage('Itinerary plan filter must be valid');

const dayNumberValidation = body('dayNumber')
  .notEmpty()
  .withMessage('Day number is required')
  .isInt({ min: 1, max: 365 })
  .withMessage('Day number must be a whole number between 1 and 365')
  .toInt();

const optionalDayNumberValidation = body('dayNumber')
  .optional()
  .isInt({ min: 1, max: 365 })
  .withMessage('Day number must be a whole number between 1 and 365')
  .toInt();

const titleValidation = body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 2, max: 140 })
  .withMessage('Title must be between 2 and 140 characters');

const optionalTitleValidation = body('title')
  .optional()
  .trim()
  .isLength({ min: 2, max: 140 })
  .withMessage('Title must be between 2 and 140 characters');

const descriptionValidation = body('description')
  .trim()
  .notEmpty()
  .withMessage('Description is required')
  .isLength({ min: 10, max: 2500 })
  .withMessage('Description must be between 10 and 2500 characters');

const optionalDescriptionValidation = body('description')
  .optional()
  .trim()
  .isLength({ min: 10, max: 2500 })
  .withMessage('Description must be between 10 and 2500 characters');

const travelTimeValidation = body('travelTime')
  .trim()
  .notEmpty()
  .withMessage('Travel time is required')
  .isLength({ min: 2, max: 120 })
  .withMessage('Travel time must be between 2 and 120 characters');

const optionalTravelTimeValidation = body('travelTime')
  .optional()
  .trim()
  .isLength({ min: 2, max: 120 })
  .withMessage('Travel time must be between 2 and 120 characters');

function arrayTextValidation(field, label, required = false) {
  let chain = body(field);

  if (!required) {
    chain = chain.optional();
  }

  return chain.custom((value) => {
    try {
      const items = parseArrayField(value);

      if (required && items.length === 0) {
        throw new Error(`${label} are required`);
      }

      if (items.some((item) => item.length < 2)) {
        throw new Error(`${label} must contain meaningful text`);
      }

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

function locationsValidation(required = false) {
  let chain = body('selectedLocations');

  if (!required) {
    chain = chain.optional();
  }

  return chain.custom((value) => {
    try {
      const items = parseArrayField(value);

      if (required && items.length === 0) {
        throw new Error('Selected locations are required');
      }

      const hasInvalidId = items.some(
        (item) => !mongoose.Types.ObjectId.isValid(item),
      );

      if (hasInvalidId) {
        throw new Error('Each selected location must be a valid location id');
      }

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

const heroImageRequiredValidation = body('heroImage').custom((value, { req }) => {
  if (!req.file) {
    throw new Error('Hero image is required');
  }

  return true;
});

const updateHasBodyValidation = body().custom((value, { req }) => {
  const allowedFields = [
    'itineraryPlanId',
    'dayNumber',
    'title',
    'description',
    'activities',
    'instructions',
    'travelTime',
    'selectedLocations',
  ];
  const hasBodyUpdate = allowedFields.some((field) => req.body[field] !== undefined);

  if (!hasBodyUpdate && !req.file) {
    throw new Error('At least one day field or hero image is required');
  }

  return true;
});

const createItineraryDayValidation = [
  planIdBodyValidation,
  dayNumberValidation,
  titleValidation,
  descriptionValidation,
  arrayTextValidation('activities', 'Activities', true),
  arrayTextValidation('instructions', 'Instructions', true),
  travelTimeValidation,
  locationsValidation(true),
  heroImageRequiredValidation,
  validateRequest,
];

const updateItineraryDayValidation = [
  dayIdValidation,
  optionalPlanIdBodyValidation,
  optionalDayNumberValidation,
  optionalTitleValidation,
  optionalDescriptionValidation,
  arrayTextValidation('activities', 'Activities'),
  arrayTextValidation('instructions', 'Instructions'),
  optionalTravelTimeValidation,
  locationsValidation(),
  updateHasBodyValidation,
  validateRequest,
];

const itineraryDayIdValidation = [dayIdValidation, validateRequest];
const itineraryDayListValidation = [planIdQueryValidation, validateRequest];

module.exports = {
  createItineraryDayValidation,
  itineraryDayIdValidation,
  itineraryDayListValidation,
  updateItineraryDayValidation,
};
