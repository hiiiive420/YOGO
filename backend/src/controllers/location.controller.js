const Location = require('../models/location.model');
const asyncHandler = require('../utils/asyncHandler');
const { resolveGoogleMapsCoordinates } = require('../utils/googleMapsCoordinates');
const {
  uploadBufferToCloudinary,
  uploadFilesToCloudinary,
} = require('../utils/cloudinaryUpload');
const { parseArrayField } = require('../utils/arrayFields');
const slugify = require('../utils/slugify');
const {
  assertCoordinateInSriLanka,
  isCoordinateInSriLanka,
} = require('../utils/sriLankaBounds');

function buildLocationPayload(body) {
  const payload = {};

  if (body.name !== undefined) payload.name = body.name.trim();
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.latitude !== undefined) payload.latitude = Number(body.latitude);
  if (body.longitude !== undefined) payload.longitude = Number(body.longitude);
  if (body.isTopLocation !== undefined) {
    payload.isTopLocation =
      body.isTopLocation === true || body.isTopLocation === 'true';
  }
  if (body.description !== undefined) payload.description = body.description.trim();

  if (!payload.slug && payload.name) {
    payload.slug = slugify(payload.name);
  }

  return payload;
}

function validateLocationCoordinates(payload, fallback = {}) {
  const latitude = payload.latitude ?? fallback.latitude;
  const longitude = payload.longitude ?? fallback.longitude;

  if (latitude !== undefined || longitude !== undefined) {
    assertCoordinateInSriLanka(latitude, longitude, 'Location coordinates');
  }
}

function getHeroImageFile(req) {
  return req.file || req.files?.image?.[0] || null;
}

function getGalleryFiles(req) {
  return req.files?.gallery || [];
}

const createLocation = asyncHandler(async (req, res) => {
  const heroImageFile = getHeroImageFile(req);
  const galleryFiles = getGalleryFiles(req);
  const imageUrl = await uploadBufferToCloudinary(heroImageFile, 'yogo/locations');
  const gallery = galleryFiles.length
    ? await uploadFilesToCloudinary(galleryFiles, 'yogo/locations/gallery')
    : [];
  const payload = {
    ...buildLocationPayload(req.body),
    gallery,
    image: imageUrl,
  };

  validateLocationCoordinates(payload);

  const location = await Location.create(payload);

  res.status(201).json({
    success: true,
    message: 'Location created successfully',
    data: location,
  });
});

const getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations,
  });
});

const getTopLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({ isTopLocation: true }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations,
  });
});

const getLocationById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404).json({
      success: false,
      message: 'Location not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: location,
  });
});

const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404).json({
      success: false,
      message: 'Location not found',
    });
    return;
  }

  const payload = buildLocationPayload(req.body);

  validateLocationCoordinates(payload, location);

  const heroImageFile = getHeroImageFile(req);
  const galleryFiles = getGalleryFiles(req);

  if (heroImageFile) {
    payload.image = await uploadBufferToCloudinary(heroImageFile, 'yogo/locations');
  }

  if (req.body.existingGallery !== undefined || galleryFiles.length) {
    const keptGallery = parseArrayField(req.body.existingGallery);
    const uploadedGallery = galleryFiles.length
      ? await uploadFilesToCloudinary(galleryFiles, 'yogo/locations/gallery')
      : [];

    payload.gallery = [...keptGallery, ...uploadedGallery];
  }

  Object.assign(location, payload);
  const updatedLocation = await location.save();

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: updatedLocation,
  });
});

const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findByIdAndDelete(req.params.id);

  if (!location) {
    res.status(404).json({
      success: false,
      message: 'Location not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Location deleted successfully',
  });
});

const resolveGoogleMapsUrl = asyncHandler(async (req, res) => {
  let coordinates = null;

  try {
    coordinates = await resolveGoogleMapsCoordinates(req.body.url);
  } catch (error) {
    res.status(422).json({
      success: false,
      message: error.message || 'Unable to resolve that Google Maps link',
    });
    return;
  }

  if (!coordinates) {
    res.status(422).json({
      success: false,
      message: 'Unable to find coordinates in that Google Maps link',
    });
    return;
  }

  if (!isCoordinateInSriLanka(coordinates.latitude, coordinates.longitude)) {
    res.status(422).json({
      success: false,
      message: 'Google Maps location must be inside Sri Lanka',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: coordinates,
  });
});

module.exports = {
  createLocation,
  getLocations,
  getTopLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  resolveGoogleMapsUrl,
};
