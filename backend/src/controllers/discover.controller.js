const Discover = require('../models/discover.model');
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

async function ensureLocationExists(locationId) {
  const location = await Location.findById(locationId).select('_id');

  if (!location) {
    const error = new Error('Connected location not found');
    error.statusCode = 404;
    throw error;
  }
}

function buildDiscoverPayload(body) {
  const payload = {};

  if (body.title !== undefined) payload.title = body.title.trim();
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.description !== undefined) payload.description = body.description.trim();
  if (body.location !== undefined) payload.location = body.location;
  if (body.highlights !== undefined) payload.highlights = parseArrayField(body.highlights);
  if (body.travelTips !== undefined) payload.travelTips = parseArrayField(body.travelTips);
  if (body.isFeatured !== undefined) payload.isFeatured = body.isFeatured === true || body.isFeatured === 'true';
  if (body.isPublished !== undefined) payload.isPublished = body.isPublished === true || body.isPublished === 'true';

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  }

  return payload;
}

async function populateDiscover(query) {
  return query.populate('location', locationPopulateFields);
}

const createDiscoverPage = asyncHandler(async (req, res) => {
  if (!req.files?.heroImage?.[0]) {
    res.status(400).json({
      success: false,
      message: 'Hero image is required',
    });
    return;
  }

  const payload = buildDiscoverPayload(req.body);
  await ensureLocationExists(payload.location);

  payload.heroImage = await uploadBufferToCloudinary(
    req.files.heroImage[0],
    'yogo/discover/hero',
    webpUploadOptions,
  );

  if (req.files.gallery?.length) {
    payload.gallery = await uploadFilesToCloudinary(
      req.files.gallery,
      'yogo/discover/gallery',
      webpUploadOptions,
    );
  }

  const discoverPage = await Discover.create(payload);
  const populatedPage = await populateDiscover(Discover.findById(discoverPage._id));

  res.status(201).json({
    success: true,
    message: 'Discover page created successfully',
    data: populatedPage,
  });
});

const getDiscoverPages = asyncHandler(async (req, res) => {
  const includeUnpublished = req.query.includeUnpublished === 'true';
  const filters = includeUnpublished ? {} : { isPublished: true };

  const discoverPages = await populateDiscover(
    Discover.find(filters).sort({ isFeatured: -1, createdAt: -1 }),
  );

  res.status(200).json({
    success: true,
    count: discoverPages.length,
    data: discoverPages,
  });
});

const getDiscoverPageBySlug = asyncHandler(async (req, res) => {
  const discoverPage = await populateDiscover(
    Discover.findOne({ slug: req.params.slug, isPublished: true }),
  );

  if (!discoverPage) {
    res.status(404).json({
      success: false,
      message: 'Discover page not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: discoverPage,
  });
});

const getDiscoverPageById = asyncHandler(async (req, res) => {
  const discoverPage = await populateDiscover(Discover.findById(req.params.id));

  if (!discoverPage) {
    res.status(404).json({
      success: false,
      message: 'Discover page not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: discoverPage,
  });
});

const updateDiscoverPage = asyncHandler(async (req, res) => {
  const discoverPage = await Discover.findById(req.params.id);

  if (!discoverPage) {
    res.status(404).json({
      success: false,
      message: 'Discover page not found',
    });
    return;
  }

  const payload = buildDiscoverPayload(req.body);

  if (payload.location) {
    await ensureLocationExists(payload.location);
  }

  if (req.files?.heroImage?.[0]) {
    payload.heroImage = await uploadBufferToCloudinary(
      req.files.heroImage[0],
      'yogo/discover/hero',
      webpUploadOptions,
    );
  }

  if (req.files?.gallery?.length) {
    const keptGallery =
      req.body.existingGallery !== undefined
        ? parseArrayField(req.body.existingGallery)
        : discoverPage.gallery || [];
    const uploadedGallery = await uploadFilesToCloudinary(
      req.files.gallery,
      'yogo/discover/gallery',
      webpUploadOptions,
    );

    payload.gallery = [...keptGallery, ...uploadedGallery];
  } else if (req.body.existingGallery !== undefined) {
    payload.gallery = parseArrayField(req.body.existingGallery);
  }

  Object.assign(discoverPage, payload);
  const updatedPage = await discoverPage.save();
  const populatedPage = await populateDiscover(Discover.findById(updatedPage._id));

  res.status(200).json({
    success: true,
    message: 'Discover page updated successfully',
    data: populatedPage,
  });
});

const deleteDiscoverPage = asyncHandler(async (req, res) => {
  const discoverPage = await Discover.findByIdAndDelete(req.params.id);

  if (!discoverPage) {
    res.status(404).json({
      success: false,
      message: 'Discover page not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Discover page deleted successfully',
  });
});

module.exports = {
  createDiscoverPage,
  deleteDiscoverPage,
  getDiscoverPageById,
  getDiscoverPageBySlug,
  getDiscoverPages,
  updateDiscoverPage,
};
