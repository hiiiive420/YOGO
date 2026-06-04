const express = require('express');
const {
  createDayTour,
  deleteDayTour,
  getDayTour,
  getDayTours,
  getDayToursByLocation,
  updateDayTour,
} = require('../controllers/dayTour.controller');
const { uploadDayTourImages } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .post(uploadDayTourImages, createDayTour)
  .get(getDayTours);

router.get('/by-location/:locationId', getDayToursByLocation);

router
  .route('/:id')
  .get(getDayTour)
  .put(uploadDayTourImages, updateDayTour)
  .delete(deleteDayTour);

module.exports = router;
