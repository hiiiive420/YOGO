const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const supportedImageExtensions = new Set([
  '.avif',
  '.heic',
  '.heif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

function isSupportedImage(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();

  return (
    file.mimetype.startsWith('image/') ||
    supportedImageExtensions.has(extension)
  );
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!isSupportedImage(file)) {
      const error = new Error('Only image uploads are allowed');
      error.statusCode = 400;
      cb(error);
      return;
    }

    cb(null, true);
  },
});

module.exports = {
  uploadAccommodationImages: upload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'gallery', maxCount: 20 },
  ]),
  uploadBlogImages: upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'gallery', maxCount: 12 },
  ]),
  uploadDiscoverImages: upload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'gallery', maxCount: 12 },
  ]),
  uploadDayTourImages: upload.any(),
  uploadItineraryCategoryThumbnail: upload.single('thumbnailImage'),
  uploadItineraryDayHero: upload.single('heroImage'),
  uploadItineraryPackageImages: upload.any(),
  uploadItineraryPlanHero: upload.single('heroImage'),
  uploadLocationImage: upload.single('image'),
  uploadLocationImages: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 12 },
  ]),
};
