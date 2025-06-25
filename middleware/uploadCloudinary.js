const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eminella-products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`,
  },
});

// 10 MB limit (Render proxy’nin kopmaması için)
// Multer yapılandırmasını aynen koruyoruz
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
