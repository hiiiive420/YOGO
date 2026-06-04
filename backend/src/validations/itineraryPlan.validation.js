const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validate');
const slugify = require('../utils/slugify');

const planIdValidation = param('id')
  .isMongoId()
  .withMessage('Invalid itinerary plan id');

const planSlugParamValidation = param('slug')
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Invalid itinerary plan slug');

const categoryIdValidation = body('categoryId')
  .notEmpty()
  .withMessage('Category id is required')
  .isMongoId()
  .withMessage('Category id must be a valid itinerary category id');

const optionalCategoryIdValidation = body('categoryId')
  .optional()
  .isMongoId()
  .withMessage('Category id must be a valid itinerary category id');

const categoryQueryValidation = query('categoryId')
  .optional()
  .isMongoId()
  .withMessage('Category filter must be a valid itinerary category id');

const themeQueryValidation = query('theme')
  .optional()
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Theme filter must be lowercase words separated by hyphens');

const slugQueryValidation = query('slug')
  .optional()
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Slug filter must be lowercase words separated by hyphens');

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

const slugValidation = body('slug')
  .optional()
  .customSanitizer((value) => slugify(value))
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Slug must be lowercase words separated by hyphens');

const shortDescriptionValidation = body('shortDescription')
  .trim()
  .notEmpty()
  .withMessage('Short description is required')
  .isLength({ min: 10, max: 600 })
  .withMessage('Short description must be between 10 and 600 characters');

const optionalShortDescriptionValidation = body('shortDescription')
  .optional()
  .trim()
  .isLength({ min: 10, max: 600 })
  .withMessage('Short description must be between 10 and 600 characters');

const totalDaysValidation = body('totalDays')
  .notEmpty()
  .withMessage('Total days is required')
  .isInt({ min: 1, max: 365 })
  .withMessage('Total days must be a whole number between 1 and 365')
  .toInt();

const optionalTotalDaysValidation = body('totalDays')
  .optional()
  .isInt({ min: 1, max: 365 })
  .withMessage('Total days must be a whole number between 1 and 365')
  .toInt();

const heroImageRequiredValidation = body('heroImage').custom((value, { req }) => {
  if (!req.file) {
    throw new Error('Hero image is required');
  }

  return true;
});

const updateHasBodyValidation = body().custom((value, { req }) => {
  const allowedFields = [
    'categoryId',
    'title',
    'slug',
    'shortDescription',
    'totalDays',
  ];
  const hasBodyUpdate = allowedFields.some((field) => req.body[field] !== undefined);

  if (!hasBodyUpdate && !req.file) {
    throw new Error('At least one plan field or hero image is required');
  }

  return true;
});

const createItineraryPlanValidation = [
  categoryIdValidation,
  titleValidation,
  slugValidation,
  shortDescriptionValidation,
  totalDaysValidation,
  heroImageRequiredValidation,
  validateRequest,
];

const updateItineraryPlanValidation = [
  planIdValidation,
  optionalCategoryIdValidation,
  optionalTitleValidation,
  slugValidation,
  optionalShortDescriptionValidation,
  optionalTotalDaysValidation,
  updateHasBodyValidation,
  validateRequest,
];

const itineraryPlanIdValidation = [planIdValidation, validateRequest];
const itineraryPlanSlugValidation = [planSlugParamValidation, validateRequest];
const itineraryPlanListValidation = [
  categoryQueryValidation,
  themeQueryValidation,
  slugQueryValidation,
  validateRequest,
];

module.exports = {
  createItineraryPlanValidation,
  itineraryPlanIdValidation,
  itineraryPlanSlugValidation,
  itineraryPlanListValidation,
  updateItineraryPlanValidation,
};
