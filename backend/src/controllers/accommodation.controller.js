const Accommodation = require('../models/accommodation.model');
const Location = require('../models/location.model');
const asyncHandler = require('../utils/asyncHandler');
const { parseArrayField } = require('../utils/arrayFields');
const {
  uploadBufferToCloudinary,
  uploadFilesToCloudinary,
} = require('../utils/cloudinaryUpload');
const slugify = require('../utils/slugify');

const locationPopulateFields = 'name slug latitude longitude image description';
const webpUploadOptions = {
  format: 'webp',
  transformation: [{ quality: 'auto:good', width: 1800, crop: 'limit' }],
};

function uniqueIds(ids) {
  return [...new Set((ids || []).map((id) => String(id)))];
}

function parseJsonArrayField(value) {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return JSON.parse(value);
}

async function ensureLocationsExist(locationIds) {
  const ids = uniqueIds(locationIds);

  if (ids.length === 0) {
    return;
  }

  const existingCount = await Location.countDocuments({ _id: { $in: ids } });

  if (existingCount !== ids.length) {
    const error = new Error('One or more connected locations were not found');
    error.statusCode = 404;
    throw error;
  }
}

function buildAccommodationPayload(body) {
  const payload = {};
  const textFields = [
    'title',
    'shortDescription',
    'fullDescription',
    'address',
    'priceRange',
    'contactNumber',
    'whatsappNumber',
    'website',
    'checkInTime',
    'checkOutTime',
  ];

  textFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field].trim();
    }
  });

  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.location !== undefined) payload.location = body.location;
  if (body.starRating !== undefined) payload.starRating = Number(body.starRating);
  if (body.amenities !== undefined) payload.amenities = parseArrayField(body.amenities);
  if (body.roomTypes !== undefined) payload.roomTypes = parseJsonArrayField(body.roomTypes);
  if (body.highlights !== undefined) payload.highlights = parseArrayField(body.highlights);
  if (body.nearbyAttractions !== undefined) {
    payload.nearbyAttractions = uniqueIds(parseArrayField(body.nearbyAttractions));
  }
  if (body.policies !== undefined) payload.policies = parseArrayField(body.policies);
  if (body.featuredReviews !== undefined) {
    payload.featuredReviews = parseJsonArrayField(body.featuredReviews);
  }

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  }

  return payload;
}

function populateAccommodation(query) {
  return query
    .populate('location', locationPopulateFields)
    .populate('nearbyAttractions', locationPopulateFields);
}

const createAccommodation = asyncHandler(async (req, res) => {
  const payload = buildAccommodationPayload(req.body);

  await ensureLocationsExist([
    payload.location,
    ...(payload.nearbyAttractions || []),
  ]);

  payload.heroImage = await uploadBufferToCloudinary(
    req.files.heroImage[0],
    'yogo/accommodations/hero',
    webpUploadOptions,
  );

  if (req.files.gallery?.length) {
    const keptGallery =
      req.body.existingGallery !== undefined
        ? parseArrayField(req.body.existingGallery)
        : [];
    const uploadedGallery = await uploadFilesToCloudinary(
      req.files.gallery,
      'yogo/accommodations/gallery',
      webpUploadOptions,
    );

    payload.gallery = [...keptGallery, ...uploadedGallery];
  } else if (req.body.existingGallery !== undefined) {
    payload.gallery = parseArrayField(req.body.existingGallery);
  }

  const accommodation = await Accommodation.create(payload);
  const populatedAccommodation = await populateAccommodation(
    Accommodation.findById(accommodation._id),
  );

  res.status(201).json({
    success: true,
    message: 'Accommodation created successfully',
    data: populatedAccommodation,
  });
});

const getAccommodations = asyncHandler(async (req, res) => {
  const accommodations = await populateAccommodation(
    Accommodation.find().sort({ createdAt: -1 }),
  );

  res.status(200).json({
    success: true,
    count: accommodations.length,
    data: accommodations,
  });
});

const getAccommodationBySlug = asyncHandler(async (req, res) => {
  const accommodation = await populateAccommodation(
    Accommodation.findOne({ slug: req.params.slug }),
  );

  if (!accommodation) {
    res.status(404).json({
      success: false,
      message: 'Accommodation not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: accommodation,
  });
});

const getAccommodationById = asyncHandler(async (req, res) => {
  const accommodation = await populateAccommodation(
    Accommodation.findById(req.params.id),
  );

  if (!accommodation) {
    res.status(404).json({
      success: false,
      message: 'Accommodation not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: accommodation,
  });
});

const updateAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id);

  if (!accommodation) {
    res.status(404).json({
      success: false,
      message: 'Accommodation not found',
    });
    return;
  }

  const payload = buildAccommodationPayload(req.body);
  const referencedLocations = [];

  if (payload.location !== undefined) referencedLocations.push(payload.location);
  if (payload.nearbyAttractions !== undefined) {
    referencedLocations.push(...payload.nearbyAttractions);
  }

  await ensureLocationsExist(referencedLocations);

  if (req.files.heroImage?.[0]) {
    payload.heroImage = await uploadBufferToCloudinary(
      req.files.heroImage[0],
      'yogo/accommodations/hero',
      webpUploadOptions,
    );
  }

  if (req.files.gallery?.length) {
    payload.gallery = await uploadFilesToCloudinary(
      req.files.gallery,
      'yogo/accommodations/gallery',
      webpUploadOptions,
    );
  }

  Object.assign(accommodation, payload);
  const updatedAccommodation = await accommodation.save();
  const populatedAccommodation = await populateAccommodation(
    Accommodation.findById(updatedAccommodation._id),
  );

  res.status(200).json({
    success: true,
    message: 'Accommodation updated successfully',
    data: populatedAccommodation,
  });
});

const deleteAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findByIdAndDelete(req.params.id);

  if (!accommodation) {
    res.status(404).json({
      success: false,
      message: 'Accommodation not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Accommodation deleted successfully',
  });
});

module.exports = {
  createAccommodation,
  deleteAccommodation,
  getAccommodationById,
  getAccommodationBySlug,
  getAccommodations,
  updateAccommodation,
};
