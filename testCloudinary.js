// testCloudinary.js
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dosya yolunu buraya gerçek dosya ismiyle değiştir
const localFilePath = 'pexels-gra-wal-38714864-7509257.jpg';

cloudinary.uploader.upload(localFilePath, (error, result) => {
  if (error) {
    console.error('Cloudinary upload error:', error);
  } else {
    console.log('Upload success:', result);
  }
});
