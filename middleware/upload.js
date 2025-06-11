// backend-api/middleware/upload.js

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary yapılandırması — ANAHTARLAR DİREKT KODDA
cloudinary.config({
  cloud_name: 'dv3evvpqx',
  api_key: '189542693115367',
  api_secret: '6yjc3lPaZr2L0-V1pYrF1oGS9XU'
});

// Cloudinary Storage ayarı
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eminella-products',      // Cloudinary'de bu klasöre yükleyecek
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

// Multer ile oluşturulan storage'u kullan
const upload = multer({ storage });

module.exports = upload;

