const express = require('express');
const {
  createLocation,
  deleteLocation,
  getLocationById,
  getLocations,
  getTopLocations,
  resolveGoogleMapsUrl,
  updateLocation,
} = require('../controllers/location.controller');
const {
  authenticateAdmin,
  requireVerifiedAdmin,
} = require('../middleware/auth');
const { uploadLocationImages } = require('../middleware/upload');
const {
  createLocationValidation,
  locationIdValidation,
  resolveGoogleMapsUrlValidation,
  updateLocationValidation,
} = require('../validations/location.validation');

const router = express.Router();
const adminOnly = [authenticateAdmin, requireVerifiedAdmin];

router
  .route('/')
  .post(uploadLocationImages, createLocationValidation, createLocation)
  .get(getLocations);

router.get('/top', getTopLocations);

router.post(
  '/resolve-map-url',
  ...adminOnly,
  resolveGoogleMapsUrlValidation,
  resolveGoogleMapsUrl,
);

router
  .route('/:id')
  .get(locationIdValidation, getLocationById)
  .put(uploadLocationImages, updateLocationValidation, updateLocation)
  .delete(locationIdValidation, deleteLocation);

module.exports = router;
