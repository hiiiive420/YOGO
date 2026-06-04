const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validate');
const slugify = require('../utils/slugify');

const categoryIdValidation = param('id')
  .isMongoId()
  .withMessage('Invalid itinerary category id');

const titleValidation = body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required')
  .isLength({ min: 2, max: 120 })
  .withMessage('Title must be between 2 and 120 characters');

const optionalTitleValidation = body('title')
  .optional()
  .trim()
  .isLength({ min: 2, max: 120 })
  .withMessage('Title must be between 2 and 120 characters');

const slugValidation = body('slug')
  .optional()
  .customSanitizer((value) => slugify(value))
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Slug must be lowercase words separated by hyphens');

const descriptionValidation = body('description')
  .trim()
  .notEmpty()
  .withMessage('Description is required')
  .isLength({ min: 10, max: 1500 })
  .withMessage('Description must be between 10 and 1500 characters');

const optionalDescriptionValidation = body('description')
  .optional()
  .trim()
  .isLength({ min: 10, max: 1500 })
  .withMessage('Description must be between 10 and 1500 characters');

const thumbnailRequiredValidation = body('thumbnailImage').custom((value, { req }) => {
  if (!req.file) {
    throw new Error('Thumbnail image is required');
  }

  return true;
});

const updateHasBodyValidation = body().custom((value, { req }) => {
  const allowedFields = ['title', 'slug', 'description'];
  const hasBodyUpdate = allowedFields.some((field) => req.body[field] !== undefined);

  if (!hasBodyUpdate && !req.file) {
    throw new Error('At least one category field or thumbnail image is required');
  }

  return true;
});

const createItineraryCategoryValidation = [
  titleValidation,
  slugValidation,
  descriptionValidation,
  thumbnailRequiredValidation,
  validateRequest,
];

const updateItineraryCategoryValidation = [
  categoryIdValidation,
  optionalTitleValidation,
  slugValidation,
  optionalDescriptionValidation,
  updateHasBodyValidation,
  validateRequest,
];

const itineraryCategoryIdValidation = [categoryIdValidation, validateRequest];

module.exports = {
  createItineraryCategoryValidation,
  itineraryCategoryIdValidation,
  updateItineraryCategoryValidation,
};
