const mongoose = require('mongoose');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { parseArrayField } = require('../utils/arrayFields');
const slugify = require('../utils/slugify');

const accommodationIdValidation = param('id')
  .isMongoId()
  .withMessage('Invalid accommodation id');

const accommodationSlugValidation = param('slug')
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Invalid accommodation slug');

const titleValidation = body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 3, max: 160 })
  .withMessage('Title must be between 3 and 160 characters');

const optionalTitleValidation = body('title')
  .optional()
  .trim()
  .isLength({ min: 3, max: 160 })
  .withMessage('Title must be between 3 and 160 characters');

const slugValidation = body('slug')
  .optional()
  .customSanitizer((value) => slugify(value))
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Slug must be lowercase words separated by hyphens');

const locationValidation = body('location')
  .notEmpty()
  .withMessage('Location is required')
  .isMongoId()
  .withMessage('Location must be a valid location id');

const optionalLocationValidation = body('location')
  .optional()
  .isMongoId()
  .withMessage('Location must be a valid location id');

function textValidation(field, label, min, max, required = true) {
  let chain = body(field);

  if (!required) {
    chain = chain.optional();
  }

  chain = chain.trim();

  if (required) {
    chain = chain.notEmpty().withMessage(`${label} is required`);
  }

  return chain
    .isLength({ min, max })
    .withMessage(`${label} must be between ${min} and ${max} characters`);
}

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

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

function locationArrayValidation(field, label, required = false) {
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

      const hasInvalidId = items.some(
        (item) => !mongoose.Types.ObjectId.isValid(item),
      );

      if (hasInvalidId) {
        throw new Error(`${label} must contain valid location ids`);
      }

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

function jsonArrayValidation(field, label, required = false) {
  let chain = body(field);

  if (!required) {
    chain = chain.optional();
  }

  return chain.custom((value) => {
    if (value === undefined || value === null || value === '') {
      if (required) throw new Error(`${label} are required`);
      return true;
    }

    if (Array.isArray(value)) {
      return true;
    }

    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error();
      }

      return true;
    } catch (error) {
      throw new Error(`${label} must be a JSON array`);
    }
  });
}

const starRatingValidation = body('starRating')
  .notEmpty()
  .withMessage('Star rating is required')
  .isFloat({ min: 1, max: 5 })
  .withMessage('Star rating must be between 1 and 5')
  .toFloat();

const optionalStarRatingValidation = body('starRating')
  .optional()
  .isFloat({ min: 1, max: 5 })
  .withMessage('Star rating must be between 1 and 5')
  .toFloat();

const heroImageRequiredValidation = body('heroImage').custom((value, { req }) => {
  if (!req.files?.heroImage?.[0]) {
    throw new Error('Hero image is required');
  }

  return true;
});

const updateHasBodyValidation = body().custom((value, { req }) => {
  const fields = [
    'title',
    'slug',
    'shortDescription',
    'fullDescription',
    'location',
    'address',
    'priceRange',
    'starRating',
    'amenities',
    'roomTypes',
    'highlights',
    'nearbyAttractions',
    'contactNumber',
    'whatsappNumber',
    'website',
    'checkInTime',
    'checkOutTime',
    'policies',
    'featuredReviews',
  ];
  const hasBodyUpdate = fields.some((field) => req.body[field] !== undefined);
  const hasHeroImage = Boolean(req.files?.heroImage?.[0]);
  const hasGallery = Boolean(req.files?.gallery?.length);

  if (!hasBodyUpdate && !hasHeroImage && !hasGallery) {
    throw new Error('At least one accommodation field or image is required');
  }

  return true;
});

const createAccommodationValidation = [
  titleValidation,
  slugValidation,
  textValidation('shortDescription', 'Short description', 10, 500),
  textValidation('fullDescription', 'Full description', 40, 8000),
  locationValidation,
  textValidation('address', 'Address', 5, 400),
  textValidation('priceRange', 'Price range', 1, 120),
  starRatingValidation,
  arrayTextValidation('amenities', 'Amenities'),
  jsonArrayValidation('roomTypes', 'Room types'),
  arrayTextValidation('highlights', 'Highlights'),
  locationArrayValidation('nearbyAttractions', 'Nearby attractions'),
  textValidation('contactNumber', 'Contact number', 1, 80, false),
  textValidation('whatsappNumber', 'WhatsApp number', 1, 80, false),
  textValidation('website', 'Website', 5, 300, false),
  textValidation('checkInTime', 'Check-in time', 1, 80, false),
  textValidation('checkOutTime', 'Check-out time', 1, 80, false),
  arrayTextValidation('policies', 'Policies'),
  jsonArrayValidation('featuredReviews', 'Featured reviews'),
  heroImageRequiredValidation,
  validateRequest,
];

const updateAccommodationValidation = [
  accommodationIdValidation,
  optionalTitleValidation,
  slugValidation,
  textValidation('shortDescription', 'Short description', 10, 500, false),
  textValidation('fullDescription', 'Full description', 40, 8000, false),
  optionalLocationValidation,
  textValidation('address', 'Address', 5, 400, false),
  textValidation('priceRange', 'Price range', 1, 120, false),
  optionalStarRatingValidation,
  arrayTextValidation('amenities', 'Amenities'),
  jsonArrayValidation('roomTypes', 'Room types'),
  arrayTextValidation('highlights', 'Highlights'),
  locationArrayValidation('nearbyAttractions', 'Nearby attractions'),
  textValidation('contactNumber', 'Contact number', 1, 80, false),
  textValidation('whatsappNumber', 'WhatsApp number', 1, 80, false),
  textValidation('website', 'Website', 5, 300, false),
  textValidation('checkInTime', 'Check-in time', 1, 80, false),
  textValidation('checkOutTime', 'Check-out time', 1, 80, false),
  arrayTextValidation('policies', 'Policies'),
  jsonArrayValidation('featuredReviews', 'Featured reviews'),
  updateHasBodyValidation,
  validateRequest,
];

const accommodationIdRequestValidation = [accommodationIdValidation, validateRequest];
const accommodationSlugRequestValidation = [
  accommodationSlugValidation,
  validateRequest,
];

module.exports = {
  accommodationIdRequestValidation,
  accommodationSlugRequestValidation,
  createAccommodationValidation,
  updateAccommodationValidation,
};
