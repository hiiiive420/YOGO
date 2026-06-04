const express = require('express');
const {
  createAccommodation,
  deleteAccommodation,
  getAccommodationById,
  getAccommodationBySlug,
  getAccommodations,
  updateAccommodation,
} = require('../controllers/accommodation.controller');
const {
  authenticateAdmin,
  requireVerifiedAdmin,
} = require('../middleware/auth');
const { uploadAccommodationImages } = require('../middleware/upload');
const {
  accommodationIdRequestValidation,
  accommodationSlugRequestValidation,
  createAccommodationValidation,
  updateAccommodationValidation,
} = require('../validations/accommodation.validation');

const router = express.Router();
const adminOnly = [authenticateAdmin, requireVerifiedAdmin];

router
  .route('/')
  .post(
    ...adminOnly,
    uploadAccommodationImages,
    createAccommodationValidation,
    createAccommodation,
  )
  .get(getAccommodations);

router.get('/slug/:slug', accommodationSlugRequestValidation, getAccommodationBySlug);
router.get('/admin/:id', ...adminOnly, accommodationIdRequestValidation, getAccommodationById);

router
  .route('/:id')
  .put(
    ...adminOnly,
    uploadAccommodationImages,
    updateAccommodationValidation,
    updateAccommodation,
  )
  .delete(...adminOnly, accommodationIdRequestValidation, deleteAccommodation);

module.exports = router;
