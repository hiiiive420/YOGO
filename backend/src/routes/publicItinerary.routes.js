const express = require('express');
const {
  createItineraryPlan,
  deleteItineraryPlan,
  getItinerariesByTheme,
  getItineraryPlan,
  getItineraryPlans,
  updateItineraryPlan,
} = require('../controllers/itineraryPlan.controller');
const { uploadItineraryPackageImages } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .post(uploadItineraryPackageImages, createItineraryPlan)
  .get(getItineraryPlans);

router.get('/by-theme/:themeId', getItinerariesByTheme);

router
  .route('/:id')
  .get(getItineraryPlan)
  .put(uploadItineraryPackageImages, updateItineraryPlan)
  .delete(deleteItineraryPlan);

module.exports = router;
