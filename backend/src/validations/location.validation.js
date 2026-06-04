const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { isAllowedGoogleMapsUrl } = require('../utils/googleMapsCoordinates');
const slugify = require('../utils/slugify');
const { isCoordinateInSriLanka } = require('../utils/sriLankaBounds');

const mongoIdValidation = param('id').isMongoId().withMessage('Invalid location id');

const nameValidation = body('name')
  .trim()
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ min: 2, max: 120 })
  .withMessage('Name must be between 2 and 120 characters');

const optionalNameValidation = body('name')
  .optional()
  .trim()
  .isLength({ min: 2, max: 120 })
  .withMessage('Name must be between 2 and 120 characters');

const slugValidation = body('slug')
  .optional()
  .customSanitizer((value) => slugify(value))
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Slug must be lowercase words separated by hyphens');

const latitudeValidation = body('latitude')
  .notEmpty()
  .withMessage('Latitude is required')
  .isFloat({ min: -90, max: 90 })
  .withMessage('Latitude must be between -90 and 90');

const optionalLatitudeValidation = body('latitude')
  .optional()
  .isFloat({ min: -90, max: 90 })
  .withMessage('Latitude must be between -90 and 90');

const longitudeValidation = body('longitude')
  .notEmpty()
  .withMessage('Longitude is required')
  .isFloat({ min: -180, max: 180 })
  .withMessage('Longitude must be between -180 and 180');

const optionalLongitudeValidation = body('longitude')
  .optional()
  .isFloat({ min: -180, max: 180 })
  .withMessage('Longitude must be between -180 and 180');

const sriLankaCoordinateValidation = body().custom((value, { req }) => {
  const hasLatitude = req.body.latitude !== undefined;
  const hasLongitude = req.body.longitude !== undefined;

  if (!hasLatitude && !hasLongitude) return true;
  if (!hasLatitude || !hasLongitude) return true;

  if (!isCoordinateInSriLanka(req.body.latitude, req.body.longitude)) {
    throw new Error('Coordinates must be inside Sri Lanka');
  }

  return true;
});

const descriptionValidation = body('description')
  .trim()
  .notEmpty()
  .withMessage('Description is required')
  .isLength({ min: 10, max: 2000 })
  .withMessage('Description must be between 10 and 2000 characters');

const optionalDescriptionValidation = body('description')
  .optional()
  .trim()
  .isLength({ min: 10, max: 2000 })
  .withMessage('Description must be between 10 and 2000 characters');

const topLocationValidation = body('isTopLocation')
  .optional()
  .isBoolean()
  .withMessage('Top Location must be true or false');

const imageRequiredValidation = body('image').custom((value, { req }) => {
  if (!req.file && !req.files?.image?.[0]) {
    throw new Error('Location image is required');
  }

  return true;
});

const updateHasBodyValidation = body().custom((value, { req }) => {
  const allowedFields = [
    'name',
    'slug',
    'latitude',
    'longitude',
    'description',
    'existingGallery',
    'isTopLocation',
  ];
  const hasBodyUpdate = allowedFields.some((field) => req.body[field] !== undefined);
  const hasUploadedFile = Boolean(
    req.file || req.files?.image?.[0] || req.files?.gallery?.length,
  );

  if (!hasBodyUpdate && !hasUploadedFile) {
    throw new Error('At least one location field or image is required');
  }

  return true;
});

const googleMapsUrlValidation = body('url')
  .trim()
  .notEmpty()
  .withMessage('Google Maps URL is required')
  .isURL({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  .withMessage('Google Maps URL must include http or https')
  .custom((value) => {
    if (!isAllowedGoogleMapsUrl(value)) {
      throw new Error('Only Google Maps links are supported');
    }

    return true;
  });

const createLocationValidation = [
  nameValidation,
  slugValidation,
  latitudeValidation,
  longitudeValidation,
  sriLankaCoordinateValidation,
  descriptionValidation,
  topLocationValidation,
  imageRequiredValidation,
  validateRequest,
];

const updateLocationValidation = [
  mongoIdValidation,
  optionalNameValidation,
  slugValidation,
  optionalLatitudeValidation,
  optionalLongitudeValidation,
  sriLankaCoordinateValidation,
  optionalDescriptionValidation,
  topLocationValidation,
  updateHasBodyValidation,
  validateRequest,
];

const locationIdValidation = [mongoIdValidation, validateRequest];

const resolveGoogleMapsUrlValidation = [
  googleMapsUrlValidation,
  validateRequest,
];

module.exports = {
  createLocationValidation,
  updateLocationValidation,
  locationIdValidation,
  resolveGoogleMapsUrlValidation,
};
