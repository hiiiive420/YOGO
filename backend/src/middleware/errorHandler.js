const multer = require('multer');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource id',
    });
    return;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token',
    });
    return;
  }

  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern || error.keyValue || {});
    const label = fields.length > 0 ? fields.join(', ') : 'value';

    res.status(409).json({
      success: false,
      message: `Duplicate ${label} already exists`,
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message),
    });
    return;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server error',
  });
}

module.exports = errorHandler;
