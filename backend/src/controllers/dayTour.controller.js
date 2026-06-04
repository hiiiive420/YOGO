const mongoose = require('mongoose');
const DayTour = require('../models/dayTour.model');
const Location = require('../models/location.model');
const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const slugify = require('../utils/slugify');
const { assertCoordinateInSriLanka } = require('../utils/sriLankaBounds');

const locationPopulateFields = 'name slug latitude longitude image description';

function parseJsonField(value, fieldName) {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    const error = new Error(`${fieldName} must be valid JSON`);
    error.statusCode = 400;
    throw error;
  }
}

function getRequestPayload(body) {
  return parseJsonField(body.dayTour, 'dayTour') || body;
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function normalizeFaqs(value) {
  const faqs = parseJsonField(value, 'faqs') || [];

  if (!Array.isArray(faqs)) return [];

  return faqs
    .map((faq) => ({
      answer: trimString(faq?.answer || ''),
      question: trimString(faq?.question || ''),
    }))
    .filter((faq) => faq.question || faq.answer);
}

function normalizePlaces(value) {
  const places = parseJsonField(value, 'places') || [];

  if (!Array.isArray(places)) return [];

  return places.map((place, index) => {
    const latitude =
      place.latitude === '' || place.latitude === undefined
        ? undefined
        : Number(place.latitude);
    const longitude =
      place.longitude === '' || place.longitude === undefined
        ? undefined
        : Number(place.longitude);

    const name = trimString(place.name || place.placeName || '');
    const slug = place.slug || name ? slugify(place.slug || name) : undefined;

    return {
      _id: place._id,
      description: trimString(place.description || ''),
      image: trimString(place.image || ''),
      latitude,
      longitude,
      name,
      slug,
      sortOrder:
        place.sortOrder === '' || place.sortOrder === undefined
          ? index + 1
          : Number(place.sortOrder),
      sourceLocationId: place.sourceLocationId || undefined,
    };
  });
}

function buildDayTourPayload(rawBody) {
  const body = getRequestPayload(rawBody);
  const payload = {};

  if (body.mainLocation !== undefined) payload.mainLocation = body.mainLocation;
  if (body.title !== undefined) payload.title = trimString(body.title);
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.shortDescription !== undefined) {
    payload.shortDescription = trimString(body.shortDescription);
  }
  if (body.fullDescription !== undefined) {
    payload.fullDescription = trimString(body.fullDescription);
  }
  if (body.isFeatured !== undefined) {
    payload.isFeatured = parseBoolean(body.isFeatured);
  }
  if (body.isTopDayTour !== undefined) {
    payload.isTopDayTour = parseBoolean(body.isTopDayTour);
  }
  if (body.status !== undefined) {
    payload.status = body.status === 'draft' ? 'draft' : 'published';
  }
  if (body.places !== undefined) payload.places = normalizePlaces(body.places);
  if (body.faqs !== undefined) payload.faqs = normalizeFaqs(body.faqs);

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  }

  return payload;
}

function getUploadedFile(req, fieldName) {
  return (req.files || []).find((file) => file.fieldname === fieldName);
}

async function applyUploadedImages(req, payload) {
  const uploadTasks = [];
  const heroFile = getUploadedFile(req, 'heroImage');

  if (heroFile) {
    uploadTasks.push(
      uploadBufferToCloudinary(heroFile, 'yogo/day-tours').then((url) => {
        payload.heroImage = url;
      }),
    );
  }

  if (Array.isArray(payload.places)) {
    const sourceLocationIds = [
      ...new Set(
        payload.places
          .map((place) => place.sourceLocationId)
          .filter(Boolean)
          .map((id) => String(id)),
      ),
    ];

    if (sourceLocationIds.length) {
      const existingCount = await Location.countDocuments({
        _id: { $in: sourceLocationIds },
      });

      if (existingCount !== sourceLocationIds.length) {
        const error = new Error('One or more place locations were not found');
        error.statusCode = 404;
        throw error;
      }
    }

    payload.places.forEach((place, index) => {
      const placeFile =
        getUploadedFile(req, `placeImage-${index}`) ||
        getUploadedFile(req, `placeImage_${index}`);

      if (!placeFile) return;

      uploadTasks.push(
        uploadBufferToCloudinary(placeFile, 'yogo/day-tour-places').then(
          (url) => {
            payload.places[index].image = url;
          },
        ),
      );
    });
  }

  await Promise.all(uploadTasks);
}

async function validatePayload(payload, existingTour = {}) {
  const mainLocation = payload.mainLocation || existingTour.mainLocation;

  if (payload.mainLocation !== undefined) {
    const location = await Location.findById(payload.mainLocation).select('_id');

    if (!location) {
      const error = new Error('Main location not found');
      error.statusCode = 404;
      throw error;
    }
  }

  if (!mainLocation) {
    const error = new Error('Main location is required');
    error.statusCode = 400;
    throw error;
  }

  if (payload.status === 'published') {
    const heroImage = payload.heroImage || existingTour.heroImage;

    if (!heroImage) {
      const error = new Error('Hero image is required before publishing');
      error.statusCode = 400;
      throw error;
    }
  }

  if (Array.isArray(payload.places)) {
    payload.places.forEach((place, index) => {
      const hasCoordinate =
        place.latitude !== undefined || place.longitude !== undefined;

      if (!hasCoordinate) return;

      assertCoordinateInSriLanka(
        place.latitude,
        place.longitude,
        `Place ${index + 1} coordinates`,
      );
    });
  }
}

function populateDayTour(query) {
  return query
    .populate('mainLocation', locationPopulateFields)
    .populate('places.sourceLocationId', locationPopulateFields);
}

function sortPlaces(tour) {
  const data = typeof tour.toObject === 'function' ? tour.toObject() : tour;

  return {
    ...data,
    places: [...(data.places || [])].sort(
      (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
    ),
  };
}

function applyFilters(req) {
  const filters = {};

  if (req.query.mainLocation) {
    filters.mainLocation = req.query.mainLocation;
  }

  if (req.query.location) {
    filters.mainLocation = req.query.location;
  }

  if (req.query.slug) {
    filters.slug = req.query.slug;
  }

  if (req.query.status === 'draft') {
    filters.status = 'draft';
  }

  if (req.query.status === 'published') {
    filters.status = 'published';
  }

  if (req.query.isTopDayTour === 'true' || req.query.showOnHome === 'true') {
    filters.isTopDayTour = true;
  }

  return filters;
}

const createDayTour = asyncHandler(async (req, res) => {
  const payload = buildDayTourPayload(req.body);

  if (!payload.status) {
    payload.status = 'published';
  }

  await applyUploadedImages(req, payload);
  await validatePayload(payload);

  const dayTour = await DayTour.create(payload);
  const populatedDayTour = sortPlaces(
    await populateDayTour(DayTour.findById(dayTour._id)),
  );

  res.status(201).json({
    success: true,
    message: 'Day tour created successfully',
    data: populatedDayTour,
  });
});

const getDayTours = asyncHandler(async (req, res) => {
  const filters = applyFilters(req);
  const tours = await populateDayTour(
    DayTour.find(filters).sort({ isFeatured: -1, createdAt: -1 }),
  );
  const data = tours.map((tour) => sortPlaces(tour));

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

const getDayToursByLocation = asyncHandler(async (req, res) => {
  const filters = applyFilters(req);

  if (mongoose.Types.ObjectId.isValid(req.params.locationId)) {
    filters.mainLocation = req.params.locationId;
  } else {
    const location = await Location.findOne({ slug: req.params.locationId }).select('_id');

    if (!location) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }

    filters.mainLocation = location._id;
  }

  const tours = await populateDayTour(
    DayTour.find(filters).sort({ isFeatured: -1, createdAt: -1 }),
  );
  const data = tours.map((tour) => sortPlaces(tour));

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

const getDayTour = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier }
    : { slug: identifier };
  const dayTour = await populateDayTour(DayTour.findOne(query));

  if (!dayTour || (req.query.status === 'published' && dayTour.status !== 'published')) {
    res.status(404).json({
      success: false,
      message: 'Day tour not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: sortPlaces(dayTour),
  });
});

const updateDayTour = asyncHandler(async (req, res) => {
  const dayTour = await DayTour.findById(req.params.id);

  if (!dayTour) {
    res.status(404).json({
      success: false,
      message: 'Day tour not found',
    });
    return;
  }

  const payload = buildDayTourPayload(req.body);

  await applyUploadedImages(req, payload);
  await validatePayload(payload, dayTour);

  Object.assign(dayTour, payload);
  const updatedDayTour = await dayTour.save();
  const populatedDayTour = sortPlaces(
    await populateDayTour(DayTour.findById(updatedDayTour._id)),
  );

  res.status(200).json({
    success: true,
    message: 'Day tour updated successfully',
    data: populatedDayTour,
  });
});

const deleteDayTour = asyncHandler(async (req, res) => {
  const dayTour = await DayTour.findByIdAndDelete(req.params.id);

  if (!dayTour) {
    res.status(404).json({
      success: false,
      message: 'Day tour not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Day tour deleted successfully',
  });
});

module.exports = {
  createDayTour,
  deleteDayTour,
  getDayTour,
  getDayTours,
  getDayToursByLocation,
  updateDayTour,
};
