const ItineraryDay = require('../models/itineraryDay.model');
const ItineraryPlan = require('../models/itineraryPlan.model');
const Location = require('../models/location.model');
const asyncHandler = require('../utils/asyncHandler');
const { parseArrayField } = require('../utils/arrayFields');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');

const planPopulateFields = 'categoryId title slug heroImage shortDescription totalDays';
const locationPopulateFields = 'name slug latitude longitude image description';

function uniqueIds(ids) {
  return [...new Set(ids.map((id) => String(id)))];
}

async function getPlanOrThrow(planId) {
  const plan = await ItineraryPlan.findById(planId).select('totalDays');

  if (!plan) {
    const error = new Error('Itinerary plan not found');
    error.statusCode = 404;
    throw error;
  }

  return plan;
}

async function ensurePlanCanUseDayNumber(planId, dayNumber) {
  const plan = await getPlanOrThrow(planId);

  if (dayNumber > plan.totalDays) {
    const error = new Error('Day number cannot exceed itinerary plan total days');
    error.statusCode = 400;
    throw error;
  }
}

async function ensureLocationsExist(locationIds) {
  const ids = uniqueIds(locationIds);
  const existingCount = await Location.countDocuments({ _id: { $in: ids } });

  if (existingCount !== ids.length) {
    const error = new Error('One or more selected locations were not found');
    error.statusCode = 404;
    throw error;
  }
}

function buildDayPayload(body) {
  const payload = {};

  if (body.itineraryPlanId !== undefined) {
    payload.itineraryPlanId = body.itineraryPlanId;
  }
  if (body.dayNumber !== undefined) payload.dayNumber = Number(body.dayNumber);
  if (body.title !== undefined) payload.title = body.title.trim();
  if (body.description !== undefined) payload.description = body.description.trim();
  if (body.activities !== undefined) payload.activities = parseArrayField(body.activities);
  if (body.instructions !== undefined) {
    payload.instructions = parseArrayField(body.instructions);
  }
  if (body.travelTime !== undefined) payload.travelTime = body.travelTime.trim();
  if (body.selectedLocations !== undefined) {
    payload.selectedLocations = uniqueIds(parseArrayField(body.selectedLocations));
  }

  return payload;
}

function populateDay(query) {
  return query
    .populate('itineraryPlanId', planPopulateFields)
    .populate('selectedLocations', locationPopulateFields);
}

const createItineraryDay = asyncHandler(async (req, res) => {
  const payload = buildDayPayload(req.body);

  await ensurePlanCanUseDayNumber(payload.itineraryPlanId, payload.dayNumber);
  await ensureLocationsExist(payload.selectedLocations);

  payload.heroImage = await uploadBufferToCloudinary(
    req.file,
    'yogo/itinerary-days',
  );

  const day = await ItineraryDay.create(payload);
  const populatedDay = await populateDay(ItineraryDay.findById(day._id));

  res.status(201).json({
    success: true,
    message: 'Itinerary day created successfully',
    data: populatedDay,
  });
});

const getItineraryDays = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.itineraryPlanId) {
    filters.itineraryPlanId = req.query.itineraryPlanId;
  }

  const days = await populateDay(
    ItineraryDay.find(filters).sort({ itineraryPlanId: 1, dayNumber: 1 }),
  );

  res.status(200).json({
    success: true,
    count: days.length,
    data: days,
  });
});

const getItineraryDayById = asyncHandler(async (req, res) => {
  const day = await populateDay(ItineraryDay.findById(req.params.id));

  if (!day) {
    res.status(404).json({
      success: false,
      message: 'Itinerary day not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: day,
  });
});

const updateItineraryDay = asyncHandler(async (req, res) => {
  const day = await ItineraryDay.findById(req.params.id);

  if (!day) {
    res.status(404).json({
      success: false,
      message: 'Itinerary day not found',
    });
    return;
  }

  const payload = buildDayPayload(req.body);
  const nextPlanId = payload.itineraryPlanId || day.itineraryPlanId;
  const nextDayNumber = payload.dayNumber || day.dayNumber;

  if (payload.itineraryPlanId !== undefined || payload.dayNumber !== undefined) {
    await ensurePlanCanUseDayNumber(nextPlanId, nextDayNumber);
  }

  if (payload.selectedLocations !== undefined) {
    await ensureLocationsExist(payload.selectedLocations);
  }

  if (req.file) {
    payload.heroImage = await uploadBufferToCloudinary(
      req.file,
      'yogo/itinerary-days',
    );
  }

  Object.assign(day, payload);
  const updatedDay = await day.save();
  const populatedDay = await populateDay(ItineraryDay.findById(updatedDay._id));

  res.status(200).json({
    success: true,
    message: 'Itinerary day updated successfully',
    data: populatedDay,
  });
});

const deleteItineraryDay = asyncHandler(async (req, res) => {
  const day = await ItineraryDay.findByIdAndDelete(req.params.id);

  if (!day) {
    res.status(404).json({
      success: false,
      message: 'Itinerary day not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Itinerary day deleted successfully',
  });
});

module.exports = {
  createItineraryDay,
  deleteItineraryDay,
  getItineraryDayById,
  getItineraryDays,
  updateItineraryDay,
};
