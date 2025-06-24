const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const prisma = new PrismaClient();
const router = express.Router();

// Cloudinary ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eminella-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

// 🔍 ——— 1) Burada aktif storage tipini yazdırıyoruz ———
console.log('✅ aktif storage tipi:', storage.constructor.name);

// ************************************
// ***********  ROUTES  ***************
// ************************************

// [POST] Yeni ürün ekleme
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    // 🔍 ——— 2) Yüklenen dosyaları logla ———
    console.log('📦 Gelen dosyalar:', req.files);

    const { name, price, category } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Görsel yüklenmedi' });
    }

    const imageUrls = req.files.map((file) => file.path); // Cloudinary linkleri

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        imageUrls,
      },
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ... (GET yolları değişmedi)

module.exports = router;
