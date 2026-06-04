const express = require('express');
const {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  getBlogs,
  updateBlog,
} = require('../controllers/blog.controller');
const { uploadBlogImages } = require('../middleware/upload');
const {
  blogIdRequestValidation,
  blogSlugRequestValidation,
  createBlogValidation,
  updateBlogValidation,
} = require('../validations/blog.validation');

const router = express.Router();

router
  .route('/')
  .post(uploadBlogImages, createBlogValidation, createBlog)
  .get(getBlogs);

router.get('/slug/:slug', blogSlugRequestValidation, getBlogBySlug);

router
  .route('/:id')
  .get(blogIdRequestValidation, getBlogById)
  .put(uploadBlogImages, updateBlogValidation, updateBlog)
  .delete(blogIdRequestValidation, deleteBlog);

module.exports = router;
