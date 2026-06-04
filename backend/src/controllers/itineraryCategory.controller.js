const ItineraryCategory = require('../models/itineraryCategory.model');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const slugify = require('../utils/slugify');

function buildCategoryPayload(body) {
  const payload = {};

  if (body.title !== undefined) payload.title = body.title.trim();
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.description !== undefined) payload.description = body.description.trim();

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  }

  return payload;
}

const createItineraryCategory = asyncHandler(async (req, res) => {
  const thumbnailImage = await uploadBufferToCloudinary(
    req.file,
    'yogo/itinerary-categories',
  );
  const payload = {
    ...buildCategoryPayload(req.body),
    thumbnailImage,
  };

  const category = await ItineraryCategory.create(payload);

  res.status(201).json({
    success: true,
    message: 'Itinerary category created successfully',
    data: category,
  });
});

const getItineraryCategories = asyncHandler(async (req, res) => {
  const categories = await ItineraryCategory.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

const getItineraryCategoryById = asyncHandler(async (req, res) => {
  const category = await ItineraryCategory.findById(req.params.id);

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Itinerary category not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

const updateItineraryCategory = asyncHandler(async (req, res) => {
  const category = await ItineraryCategory.findById(req.params.id);

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Itinerary category not found',
    });
    return;
  }

  const payload = buildCategoryPayload(req.body);

  if (req.file) {
    payload.thumbnailImage = await uploadBufferToCloudinary(
      req.file,
      'yogo/itinerary-categories',
    );
  }

  Object.assign(category, payload);
  const updatedCategory = await category.save();

  res.status(200).json({
    success: true,
    message: 'Itinerary category updated successfully',
    data: updatedCategory,
  });
});

const deleteItineraryCategory = asyncHandler(async (req, res) => {
  const category = await ItineraryCategory.findByIdAndDelete(req.params.id);

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Itinerary category not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Itinerary category deleted successfully',
  });
});

module.exports = {
  createItineraryCategory,
  deleteItineraryCategory,
  getItineraryCategories,
  getItineraryCategoryById,
  updateItineraryCategory,
};
