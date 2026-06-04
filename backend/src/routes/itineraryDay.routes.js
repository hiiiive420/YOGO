const express = require('express');
const {
  createItineraryDay,
  deleteItineraryDay,
  getItineraryDayById,
  getItineraryDays,
  updateItineraryDay,
} = require('../controllers/itineraryDay.controller');
const { uploadItineraryDayHero } = require('../middleware/upload');
const {
  createItineraryDayValidation,
  itineraryDayIdValidation,
  itineraryDayListValidation,
  updateItineraryDayValidation,
} = require('../validations/itineraryDay.validation');

const router = express.Router();

router
  .route('/')
  .post(uploadItineraryDayHero, createItineraryDayValidation, createItineraryDay)
  .get(itineraryDayListValidation, getItineraryDays);

router
  .route('/:id')
  .get(itineraryDayIdValidation, getItineraryDayById)
  .put(uploadItineraryDayHero, updateItineraryDayValidation, updateItineraryDay)
  .delete(itineraryDayIdValidation, deleteItineraryDay);

module.exports = router;
