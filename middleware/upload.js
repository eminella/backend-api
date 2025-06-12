const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eminella-products',
    resource_type: 'image',
    format: async () => 'webp',
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`
  }
});

module.exports = multer({ storage });
