const Blog = require('../models/blog.model');
const Location = require('../models/location.model');
const asyncHandler = require('../utils/asyncHandler');
const { parseArrayField } = require('../utils/arrayFields');
const {
  uploadBufferToCloudinary,
  uploadFilesToCloudinary,
} = require('../utils/cloudinaryUpload');
const slugify = require('../utils/slugify');

const locationPopulateFields = 'name slug latitude longitude image description';

function uniqueIds(ids) {
  return [...new Set(ids.map((id) => String(id)))];
}

async function ensureLocationsExist(locationIds) {
  const ids = uniqueIds(locationIds || []);

  if (ids.length === 0) {
    return;
  }

  const existingCount = await Location.countDocuments({ _id: { $in: ids } });

  if (existingCount !== ids.length) {
    const error = new Error('One or more related locations were not found');
    error.statusCode = 404;
    throw error;
  }
}

function buildBlogPayload(body) {
  const payload = {};

  if (body.title !== undefined) payload.title = body.title.trim();
  if (body.slug !== undefined) payload.slug = slugify(body.slug);
  if (body.content !== undefined) payload.content = body.content.trim();
  if (body.seoTitle !== undefined) payload.seoTitle = body.seoTitle.trim();
  if (body.seoDescription !== undefined) {
    payload.seoDescription = body.seoDescription.trim();
  }
  if (body.relatedLocations !== undefined) {
    payload.relatedLocations = uniqueIds(parseArrayField(body.relatedLocations));
  }

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title);
  }

  return payload;
}

function populateBlog(query) {
  return query.populate('relatedLocations', locationPopulateFields);
}

const createBlog = asyncHandler(async (req, res) => {
  const payload = buildBlogPayload(req.body);

  await ensureLocationsExist(payload.relatedLocations);

  payload.featuredImage = await uploadBufferToCloudinary(
    req.files.featuredImage[0],
    'yogo/blogs/featured',
  );

  if (req.files.gallery?.length) {
    const keptGallery =
      req.body.existingGallery !== undefined
        ? parseArrayField(req.body.existingGallery)
        : [];
    const uploadedGallery = await uploadFilesToCloudinary(
      req.files.gallery,
      'yogo/blogs/gallery',
    );

    payload.gallery = [...keptGallery, ...uploadedGallery];
  } else if (req.body.existingGallery !== undefined) {
    payload.gallery = parseArrayField(req.body.existingGallery);
  }

  const blog = await Blog.create(payload);
  const populatedBlog = await populateBlog(Blog.findById(blog._id));

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    data: populatedBlog,
  });
});

const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await populateBlog(Blog.find().sort({ createdAt: -1 }));

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs,
  });
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await populateBlog(Blog.findById(req.params.id));

  if (!blog) {
    res.status(404).json({
      success: false,
      message: 'Blog not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await populateBlog(Blog.findOne({ slug: req.params.slug }));

  if (!blog) {
    res.status(404).json({
      success: false,
      message: 'Blog not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404).json({
      success: false,
      message: 'Blog not found',
    });
    return;
  }

  const payload = buildBlogPayload(req.body);

  if (payload.relatedLocations !== undefined) {
    await ensureLocationsExist(payload.relatedLocations);
  }

  if (req.files.featuredImage?.[0]) {
    payload.featuredImage = await uploadBufferToCloudinary(
      req.files.featuredImage[0],
      'yogo/blogs/featured',
    );
  }

  if (req.files.gallery?.length) {
    payload.gallery = await uploadFilesToCloudinary(
      req.files.gallery,
      'yogo/blogs/gallery',
    );
  }

  Object.assign(blog, payload);
  const updatedBlog = await blog.save();
  const populatedBlog = await populateBlog(Blog.findById(updatedBlog._id));

  res.status(200).json({
    success: true,
    message: 'Blog updated successfully',
    data: populatedBlog,
  });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) {
    res.status(404).json({
      success: false,
      message: 'Blog not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully',
  });
});

module.exports = {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  getBlogs,
  updateBlog,
};
