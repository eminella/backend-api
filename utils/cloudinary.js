// backend-api/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // dv3evvpqx
  api_key:    process.env.CLOUDINARY_API_KEY,     // 199927129956135
  api_secret: process.env.CLOUDINARY_API_SECRET,  // •••
  secure: true,
});

module.exports = cloudinary;
