const mongoose = require('mongoose');
const ItineraryCategory = require('../models/itineraryCategory.model');
const ItineraryDay = require('../models/itineraryDay.model');
const ItineraryPlan = require('../models/itineraryPlan.model');
const Location = require('../models/location.model');
const asyncHandler = require('../utils/asyncHandler');
const { parseArrayField } = require('../utils/arrayFields');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const slugify = require('../utils/slugify');

const categoryPopulateFields = 'title slug thumbnailImage description';
const locationPopulateFields = 'name slug latitude longitude image description';

async function ensureCategoryExists(categoryId) {
  const category = await ItineraryCategory.findById(categoryId).select('_id');

  if (!category) {
    const error = new Error('Travel theme not found');
    error.statusCode = 404;
    throw error;
  }
}

function uniqueIds(ids = []) {
  return [...new Set(ids.map((id) => String(id)).filter(Boolean))];
}

async function ensureLocationsExist(locationIds) {
  const ids = uniqueIds(locationIds);

  if (!ids.length) return;

  const existingCount = await Location.countDocuments({ _id: { $in: ids } });

  if (existingCount !== ids.length) {
    const error = new Error('One or more selected locations were not found');
    error.statusCode = 404;
    throw error;
  }
}

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
  return parseJsonField(body.package, 'package') || body;
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

function getCategoryId(body) {
  return body.categoryId || body.travelTheme || body.travelThemeId;
}

function normalizeStringArray(value) {
  return parseArrayField(value);
}

function normalizeLocationIds(value) {
  const items = Array.isArray(value) ? value : parseArrayField(value);

  return uniqueIds(
    items
      .map((item) => (typeof item === 'object' ? item?._id : item))
      .filter(Boolean),
  );
}

function normalizeFaqs(value) {
  const faqs = parseJsonField(value, 'faqs') || [];

  if (!Array.isArray(faqs)) return [];

  return faqs
    .map((faq) => ({
      question: trimString(faq?.question || ''),
      answer: trimString(faq?.answer || ''),
    }))
    .filter((faq) => faq.question || faq.answer);
}

function normalizePackageDays(value, totalDays) {
  const parsedDays = parseJsonField(value, 'days') || [];
  const days = Array.isArray(parsedDays) ? parsedDays : [];
  const byNumber = new Map();

  days.forEach((day) => {
    const dayNumber = Number(day?.dayNumber);
    if (!Number.isInteger(dayNumber) || dayNumber < 1) return;

    byNumber.set(dayNumber, day);
  });

  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const day = byNumber.get(dayNumber) || {};

    return {
      _id: day._id,
      activities: normalizeStringArray(day.activities),
      dayNumber,
      description: trimString(day.description || ''),
      heroImage: trimString(day.heroImage || ''),
      instructions: normalizeStringArray(day.instructions),
      locations: normalizeLocationIds(day.locations || day.selectedLocations),
      title: trimString(day.title || ''),
      travelTime: trimString(day.travelTime || ''),
    };
  });
}

function buildPlanPayload(rawBody, existingPlan = null) {
  const body = getRequestPayload(rawBody);
  const payload = {};

  const categoryId = getCategoryId(body);
  if (categoryId !== undefined) payload.categoryId = categoryId;
  if (body.title !== undefined) payload.title = trimString(body.title);
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.shortDescription !== undefined) {
    payload.shortDescription = trimString(body.shortDescription);
  }
  if (body.fullDescription !== undefined) {
    payload.fullDescription = trimString(body.fullDescription);
  }
  if (body.contactCtaText !== undefined) {
    payload.contactCtaText = trimString(body.contactCtaText);
  }
  if (body.isTopActivityPackage !== undefined) {
    payload.isTopActivityPackage = parseBoolean(body.isTopActivityPackage);
  }
  if (body.status !== undefined) {
    payload.status = body.status === 'draft' ? 'draft' : 'published';
  }
  if (body.totalDays !== undefined) {
    payload.totalDays = Number(body.totalDays);
  }
  if (body.faqs !== undefined) {
    payload.faqs = normalizeFaqs(body.faqs);
  }

  const totalDays = payload.totalDays || existingPlan?.totalDays;
  if (body.days !== undefined && Number.isInteger(Number(totalDays))) {
    payload.days = normalizePackageDays(body.days, Number(totalDays));
  } else if (payload.totalDays !== undefined && existingPlan?.days?.length) {
    payload.days = normalizePackageDays(existingPlan.days, Number(payload.totalDays));
  }

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  }

  return payload;
}

function getUploadedFile(req, fieldName) {
  if (req.file && (req.file.fieldname === fieldName || fieldName === 'heroImage')) {
    return req.file;
  }

  return (req.files || []).find((file) => file.fieldname === fieldName);
}

async function applyUploadedImages(req, payload) {
  const uploadTasks = [];
  const heroFile = getUploadedFile(req, 'heroImage');

  if (heroFile) {
    uploadTasks.push(
      uploadBufferToCloudinary(heroFile, 'yogo/itinerary-plans').then((url) => {
        payload.heroImage = url;
      }),
    );
  }

  if (Array.isArray(payload.days)) {
    payload.days.forEach((day, index) => {
      const dayFile =
        getUploadedFile(req, `dayHeroImage-${day.dayNumber}`) ||
        getUploadedFile(req, `dayHeroImage_${day.dayNumber}`);

      if (!dayFile) return;

      uploadTasks.push(
        uploadBufferToCloudinary(dayFile, 'yogo/itinerary-days').then((url) => {
          payload.days[index].heroImage = url;
        }),
      );
    });
  }

  await Promise.all(uploadTasks);
}

async function validatePackagePayload(payload) {
  if (payload.categoryId) {
    await ensureCategoryExists(payload.categoryId);
  }

  if (Array.isArray(payload.days)) {
    const locationIds = payload.days.flatMap((day) => day.locations || []);
    await ensureLocationsExist(locationIds);

    payload.days.forEach((day) => {
      if (payload.totalDays && day.dayNumber > payload.totalDays) {
        const error = new Error('Day number cannot exceed total days');
        error.statusCode = 400;
        throw error;
      }
    });
  }
}

function populatePlan(query) {
  return query
    .populate('categoryId', categoryPopulateFields)
    .populate('days.locations', locationPopulateFields);
}

function populateLegacyDay(query) {
  return query.populate('selectedLocations', locationPopulateFields);
}

function normalizeDayForResponse(day) {
  const data = typeof day.toObject === 'function' ? day.toObject() : day;
  const locations = data.locations || data.selectedLocations || [];

  return {
    ...data,
    locations,
    selectedLocations: locations,
  };
}

function normalizePlanForResponse(plan, legacyDays = []) {
  const data = typeof plan.toObject === 'function' ? plan.toObject() : plan;
  const embeddedDays = Array.isArray(data.days) ? data.days : [];
  const sourceDays = embeddedDays.length > 0 ? embeddedDays : legacyDays;
  const days = sourceDays
    .map((day) => normalizeDayForResponse(day))
    .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));

  return {
    ...data,
    days,
    travelTheme: data.categoryId,
  };
}

async function withLegacyDaysFallback(plan) {
  const data = typeof plan.toObject === 'function' ? plan.toObject() : plan;

  if (Array.isArray(data.days) && data.days.length > 0) {
    return normalizePlanForResponse(plan);
  }

  const legacyDays = await populateLegacyDay(
    ItineraryDay.find({ itineraryPlanId: data._id }).sort({ dayNumber: 1 }),
  );

  return normalizePlanForResponse(plan, legacyDays);
}

function applyListFilters(req) {
  const filters = {};

  if (req.query.categoryId) {
    filters.categoryId = req.query.categoryId;
  }

  if (req.query.themeId) {
    filters.categoryId = req.query.themeId;
  }

  if (req.query.slug) {
    filters.slug = req.query.slug;
  }

  if (req.query.status === 'draft') {
    filters.status = 'draft';
  }

  if (req.query.status === 'published') {
    filters.$or = [{ status: 'published' }, { status: { $exists: false } }];
  }

  if (
    req.query.isTopActivityPackage === 'true' ||
    req.query.showOnHome === 'true'
  ) {
    filters.isTopActivityPackage = true;
  }

  return filters;
}

async function applyThemeSlugFilter(filters, themeSlug) {
  if (!themeSlug) return true;

  const category = await ItineraryCategory.findOne({ slug: themeSlug }).select('_id');

  if (!category) return false;

  filters.categoryId = category._id;
  return true;
}

const createItineraryPlan = asyncHandler(async (req, res) => {
  const payload = buildPlanPayload(req.body);

  await applyUploadedImages(req, payload);
  await validatePackagePayload(payload);

  if (!payload.heroImage) {
    const error = new Error('Hero image is required');
    error.statusCode = 400;
    throw error;
  }

  const plan = await ItineraryPlan.create(payload);
  const populatedPlan = await withLegacyDaysFallback(
    await populatePlan(ItineraryPlan.findById(plan._id)),
  );

  res.status(201).json({
    success: true,
    message: 'Activity package created successfully',
    data: populatedPlan,
  });
});

const getItineraryPlans = asyncHandler(async (req, res) => {
  const filters = applyListFilters(req);
  const hasTheme = await applyThemeSlugFilter(filters, req.query.theme);

  if (!hasTheme) {
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
    return;
  }

  const plans = await populatePlan(
    ItineraryPlan.find(filters).sort({ createdAt: -1 }),
  );
  const data = await Promise.all(plans.map((plan) => withLegacyDaysFallback(plan)));

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

const getItinerariesByTheme = asyncHandler(async (req, res) => {
  const filters = applyListFilters(req);
  const themeIdentifier = req.params.themeId;

  if (mongoose.Types.ObjectId.isValid(themeIdentifier)) {
    filters.categoryId = themeIdentifier;
  } else {
    const hasTheme = await applyThemeSlugFilter(filters, themeIdentifier);

    if (!hasTheme) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
      return;
    }
  }

  const plans = await populatePlan(
    ItineraryPlan.find(filters).sort({ createdAt: -1 }),
  );
  const data = await Promise.all(plans.map((plan) => withLegacyDaysFallback(plan)));

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});

const getItineraryPlan = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.slug;
  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier }
    : { slug: identifier };
  const plan = await populatePlan(ItineraryPlan.findOne(query).sort({ createdAt: -1 }));

  if (!plan) {
    res.status(404).json({
      success: false,
      message: 'Activity package not found',
    });
    return;
  }

  if (req.query.status === 'published' && plan.status === 'draft') {
    res.status(404).json({
      success: false,
      message: 'Activity package not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: await withLegacyDaysFallback(plan),
  });
});

const updateItineraryPlan = asyncHandler(async (req, res) => {
  const plan = await ItineraryPlan.findById(req.params.id);

  if (!plan) {
    res.status(404).json({
      success: false,
      message: 'Activity package not found',
    });
    return;
  }

  const payload = buildPlanPayload(req.body, plan);

  await applyUploadedImages(req, payload);
  await validatePackagePayload(payload);

  Object.assign(plan, payload);
  const updatedPlan = await plan.save();
  const populatedPlan = await withLegacyDaysFallback(
    await populatePlan(ItineraryPlan.findById(updatedPlan._id)),
  );

  res.status(200).json({
    success: true,
    message: 'Activity package updated successfully',
    data: populatedPlan,
  });
});

const deleteItineraryPlan = asyncHandler(async (req, res) => {
  const plan = await ItineraryPlan.findByIdAndDelete(req.params.id);

  if (!plan) {
    res.status(404).json({
      success: false,
      message: 'Activity package not found',
    });
    return;
  }

  await ItineraryDay.deleteMany({ itineraryPlanId: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Activity package deleted successfully',
  });
});

module.exports = {
  createItineraryPlan,
  deleteItineraryPlan,
  getItinerariesByTheme,
  getItineraryPlan,
  getItineraryPlanBySlug: getItineraryPlan,
  getItineraryPlanById: getItineraryPlan,
  getItineraryPlans,
  updateItineraryPlan,
};
