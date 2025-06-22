const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eminella-products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`,
  },
});

const upload = multer({ storage });

module.exports = upload;
