const cloudinary = require('cloudinary').v2;

function ensureCloudinaryConfig() {
  const requiredKeys = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Cloudinary config: ${missingKeys.join(', ')}`);
  }

  const placeholderKeys = requiredKeys.filter((key) =>
    /^your_|^replace_with_/i.test(process.env[key]),
  );

  if (placeholderKeys.length > 0) {
    const error = new Error(
      `Cloudinary config still uses placeholder values: ${placeholderKeys.join(', ')}`,
    );
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = {
  cloudinary,
  ensureCloudinaryConfig,
};
