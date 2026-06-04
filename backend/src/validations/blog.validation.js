const mongoose = require('mongoose');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validate');
const { parseArrayField } = require('../utils/arrayFields');
const slugify = require('../utils/slugify');

const blogIdValidation = param('id').isMongoId().withMessage('Invalid blog id');

const blogSlugValidation = param('slug')
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Invalid blog slug');

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

const contentValidation = body('content')
  .trim()
  .notEmpty()
  .withMessage('Content is required')
  .isLength({ min: 50, max: 50000 })
  .withMessage('Content must be between 50 and 50000 characters');

const optionalContentValidation = body('content')
  .optional()
  .trim()
  .isLength({ min: 50, max: 50000 })
  .withMessage('Content must be between 50 and 50000 characters');

const seoTitleValidation = body('seoTitle')
  .optional()
  .trim()
  .isLength({ max: 180 })
  .withMessage('SEO title cannot exceed 180 characters');

const seoDescriptionValidation = body('seoDescription')
  .optional()
  .trim()
  .isLength({ max: 320 })
  .withMessage('SEO description cannot exceed 320 characters');

const featuredImageRequiredValidation = body('featuredImage').custom((value, { req }) => {
  if (!req.files?.featuredImage?.[0]) {
    throw new Error('Featured image is required');
  }

  return true;
});

function relatedLocationsValidation(required = false) {
  let chain = body('relatedLocations');

  if (!required) {
    chain = chain.optional();
  }

  return chain.custom((value) => {
    try {
      const items = parseArrayField(value);

      if (required && items.length === 0) {
        throw new Error('Related locations are required');
      }

      const hasInvalidId = items.some(
        (item) => !mongoose.Types.ObjectId.isValid(item),
      );

      if (hasInvalidId) {
        throw new Error('Each related location must be a valid location id');
      }

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  });
}

const updateHasBodyValidation = body().custom((value, { req }) => {
  const allowedFields = [
    'title',
    'slug',
    'content',
    'relatedLocations',
    'seoTitle',
    'seoDescription',
  ];
  const hasBodyUpdate = allowedFields.some((field) => req.body[field] !== undefined);
  const hasFeaturedImage = Boolean(req.files?.featuredImage?.[0]);
  const hasGallery = Boolean(req.files?.gallery?.length);

  if (!hasBodyUpdate && !hasFeaturedImage && !hasGallery) {
    throw new Error('At least one blog field or image is required');
  }

  return true;
});

const createBlogValidation = [
  titleValidation,
  slugValidation,
  contentValidation,
  seoTitleValidation,
  seoDescriptionValidation,
  relatedLocationsValidation(),
  featuredImageRequiredValidation,
  validateRequest,
];

const updateBlogValidation = [
  blogIdValidation,
  optionalTitleValidation,
  slugValidation,
  optionalContentValidation,
  seoTitleValidation,
  seoDescriptionValidation,
  relatedLocationsValidation(),
  updateHasBodyValidation,
  validateRequest,
];

const blogIdRequestValidation = [blogIdValidation, validateRequest];
const blogSlugRequestValidation = [blogSlugValidation, validateRequest];

module.exports = {
  blogIdRequestValidation,
  blogSlugRequestValidation,
  createBlogValidation,
  updateBlogValidation,
};
