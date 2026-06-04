const express = require('express');
const {
  createInquiry,
  getInquiries,
} = require('../controllers/inquiry.controller');
const {
  authenticateAdmin,
  requireVerifiedAdmin,
} = require('../middleware/auth');

const router = express.Router();
const adminOnly = [authenticateAdmin, requireVerifiedAdmin];

router
  .route('/')
  .post(createInquiry)
  .get(...adminOnly, getInquiries);

module.exports = router;
