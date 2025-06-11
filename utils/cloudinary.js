const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dv3evvpqx',                      // Cloudinary'deki Cloud Name
  api_key: '189542693115367',                   // Cloudinary API Key
  api_secret: '6yjc3IPaZr2L0-V1pYrF1oGS9XU',     // Cloudinary API Secret
});

module.exports = cloudinary;
