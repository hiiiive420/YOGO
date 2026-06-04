const express = require('express');
const {
  createDiscoverPage,
  deleteDiscoverPage,
  getDiscoverPageById,
  getDiscoverPageBySlug,
  getDiscoverPages,
  updateDiscoverPage,
} = require('../controllers/discover.controller');
const { uploadDiscoverImages } = require('../middleware/upload');
const {
  createDiscoverValidation,
  discoverIdValidation,
  discoverSlugValidation,
  updateDiscoverValidation,
} = require('../validations/discover.validation');

const router = express.Router();

router
  .route('/')
  .post(uploadDiscoverImages, createDiscoverValidation, createDiscoverPage)
  .get(getDiscoverPages);

router.get('/admin/:id', discoverIdValidation, getDiscoverPageById);

router
  .route('/:id')
  .put(uploadDiscoverImages, updateDiscoverValidation, updateDiscoverPage)
  .delete(discoverIdValidation, deleteDiscoverPage);

router.get('/:slug', discoverSlugValidation, getDiscoverPageBySlug);

module.exports = router;
