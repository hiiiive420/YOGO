const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { parseArrayField } = require('../utils/arrayFields');
const slugify = require('../utils/slugify');

const mongoIdParamValidation = param('id').isMongoId().withMessage('Invalid discover id');

const slugParamValidation = param('slug')
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Invalid discover slug');

const titleValidation = body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 3, max: 140 })
  .withMessage('Title must be between 3 and 140 characters');

const optionalTitleValidation = body('title')
  .optional()
  .trim()
  .isLength({ min: 3, max: 140 })
  .withMessage('Title must be between 3 and 140 characters');

const slugValidation = body('slug')
  .optional()
  .customSanitizer((value) => slugify(value))
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase words separated by hyphens');

const descriptionValidation = body('description')
  .trim()
  .notEmpty()
  .withMessage('Description is required')
  .isLength({ min: 40, max: 8000 })
  .withMessage('Description must be between 40 and 8000 characters');

const optionalDescriptionValidation = body('description')
  .optional()
  .trim()
  .isLength({ min: 40, max: 8000 })
  .withMessage('Description must be between 40 and 8000 characters');

const locationValidation = body('location')
  .notEmpty()
  .withMessage('Connected location is required')
  .isMongoId()
  .withMessage('Connected location must be a valid location id');

const optionalLocationValidation = body('location')
  .optional()
  .isMongoId()
  .withMessage('Connected location must be a valid location id');

function arrayValidation(field, label, required = false) {
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

const booleanValidation = (field) =>
  body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be true or false`)
    .toBoolean();

const updateHasBodyValidation = body().custom((value, { req }) => {
  const allowedFields = [
    'title',
    'slug',
    'description',
    'location',
    'highlights',
    'travelTips',
    'isFeatured',
    'isPublished',
  ];
  const hasBodyUpdate = allowedFields.some((field) => req.body[field] !== undefined);

  if (
    !hasBodyUpdate &&
    !req.files?.heroImage?.length &&
    !req.files?.gallery?.length
  ) {
    throw new Error('At least one discover field or gallery image is required');
  }

  return true;
});

const createDiscoverValidation = [
  titleValidation,
  slugValidation,
  descriptionValidation,
  locationValidation,
  arrayValidation('highlights', 'Highlights', true),
  arrayValidation('travelTips', 'Travel tips', true),
  booleanValidation('isFeatured'),
  booleanValidation('isPublished'),
  validateRequest,
];

const updateDiscoverValidation = [
  mongoIdParamValidation,
  optionalTitleValidation,
  slugValidation,
  optionalDescriptionValidation,
  optionalLocationValidation,
  arrayValidation('highlights', 'Highlights'),
  arrayValidation('travelTips', 'Travel tips'),
  booleanValidation('isFeatured'),
  booleanValidation('isPublished'),
  updateHasBodyValidation,
  validateRequest,
];

const discoverIdValidation = [mongoIdParamValidation, validateRequest];
const discoverSlugValidation = [slugParamValidation, validateRequest];

module.exports = {
  createDiscoverValidation,
  updateDiscoverValidation,
  discoverIdValidation,
  discoverSlugValidation,
};
