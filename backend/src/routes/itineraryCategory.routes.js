const express = require('express');
const {
  createItineraryCategory,
  deleteItineraryCategory,
  getItineraryCategories,
  getItineraryCategoryById,
  updateItineraryCategory,
} = require('../controllers/itineraryCategory.controller');
const { uploadItineraryCategoryThumbnail } = require('../middleware/upload');
const {
  createItineraryCategoryValidation,
  itineraryCategoryIdValidation,
  updateItineraryCategoryValidation,
} = require('../validations/itineraryCategory.validation');

const router = express.Router();

router
  .route('/')
  .post(
    uploadItineraryCategoryThumbnail,
    createItineraryCategoryValidation,
    createItineraryCategory,
  )
  .get(getItineraryCategories);

router
  .route('/:id')
  .get(itineraryCategoryIdValidation, getItineraryCategoryById)
  .put(
    uploadItineraryCategoryThumbnail,
    updateItineraryCategoryValidation,
    updateItineraryCategory,
  )
  .delete(itineraryCategoryIdValidation, deleteItineraryCategory);

module.exports = router;
