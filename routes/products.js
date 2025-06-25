const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const prisma = new PrismaClient();
const router = express.Router();

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary için storage tanımı
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eminella-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Multer middleware (upload)
const upload = multer({ storage });

// POST /api/products - Çoklu görsel yükleyerek ürün ekle
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    // Yüklenen dosyaları logla
    console.log('📦 Gelen dosyalar:', req.files);

    const { name, price, category, description } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Görsel yüklenmedi' });
    }

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Eksik ürün bilgisi' });
    }

    // Cloudinary'den dönen URL'ler
    const imageUrls = req.files.map(file => file.path);

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        description: description || null,
        imageUrls,
      },
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products:', err);
    return res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
});

module.exports = router;
