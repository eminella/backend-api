require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dv3evvpqx',
  api_key: process.env.CLOUDINARY_API_KEY || '189542693115367',
  api_secret: process.env.CLOUDINARY_API_SECRET || '6yjc3IPaZr2L0-V1pYrF1oGS9XU',
});

module.exports = cloudinary;
