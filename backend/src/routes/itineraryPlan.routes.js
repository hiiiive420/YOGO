const express = require('express');
const {
  createItineraryPlan,
  deleteItineraryPlan,
  getItineraryPlanById,
  getItineraryPlans,
  updateItineraryPlan,
} = require('../controllers/itineraryPlan.controller');
const { uploadItineraryPlanHero } = require('../middleware/upload');
const {
  createItineraryPlanValidation,
  itineraryPlanIdValidation,
  itineraryPlanListValidation,
  updateItineraryPlanValidation,
} = require('../validations/itineraryPlan.validation');

const router = express.Router();

router
  .route('/')
  .post(uploadItineraryPlanHero, createItineraryPlanValidation, createItineraryPlan)
  .get(itineraryPlanListValidation, getItineraryPlans);

router
  .route('/:id')
  .get(itineraryPlanIdValidation, getItineraryPlanById)
  .put(uploadItineraryPlanHero, updateItineraryPlanValidation, updateItineraryPlan)
  .delete(itineraryPlanIdValidation, deleteItineraryPlan);

module.exports = router;
