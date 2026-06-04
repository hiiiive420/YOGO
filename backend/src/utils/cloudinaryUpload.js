const { cloudinary, ensureCloudinaryConfig } = require('../config/cloudinary');

const optimizedDeliveryTransformation = [
  {
    fetch_format: 'auto',
    quality: 'auto',
  },
];

const defaultUploadTransformation = [
  {
    crop: 'limit',
    fetch_format: 'auto',
    quality: 'auto',
    width: 2000,
  },
];

function normalizeTransformation(value) {
  if (!value) return defaultUploadTransformation;

  return Array.isArray(value) ? value : [value];
}

function getOptimizedUploadOptions(folder, options = {}) {
  return {
    folder,
    resource_type: 'image',
    transformation: normalizeTransformation(options.transformation),
    ...options,
    fetch_format: 'auto',
    format: 'webp',
    quality: 'auto',
  };
}

function getOptimizedSecureUrl(result) {
  if (!result?.public_id) {
    return result?.secure_url;
  }

  return cloudinary.url(result.public_id, {
    format: 'webp',
    resource_type: result.resource_type || 'image',
    secure: true,
    transformation: optimizedDeliveryTransformation,
    type: result.type || 'upload',
    version: result.version,
  });
}

function uploadBufferToCloudinary(file, folder, options = {}) {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      getOptimizedUploadOptions(folder, options),
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(getOptimizedSecureUrl(result));
      },
    );

    uploadStream.end(file.buffer);
  });
}

async function uploadFilesToCloudinary(files, folder, options = {}) {
  return Promise.all(
    files.map((file) => uploadBufferToCloudinary(file, folder, options)),
  );
}

module.exports = {
  uploadBufferToCloudinary,
  uploadFilesToCloudinary,
};
