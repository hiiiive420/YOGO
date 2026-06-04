const express = require('express');
const { getItineraryCategories } = require('../controllers/itineraryCategory.controller');

const router = express.Router();

router.get('/', getItineraryCategories);

module.exports = router;
