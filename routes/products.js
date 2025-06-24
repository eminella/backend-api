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

// Multer Cloudinary storage (çoklu dosya)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'eminella-products', // Cloudinary klasör adı
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

// 📌 [POST] Yeni ürün ekleme (çoklu görsel Cloudinary destekli)
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Görsel yüklenmedi' });
    }

    const imageUrls = req.files.map(file => file.path); // Cloudinary linki

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        imageUrls,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 [GET] Ürün listesi
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 📌 [GET] Ürün detayı
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Geçersiz ID' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    res.json(product);
  } catch (err) {
    console.error(`GET /api/products/${req.params.id}:`, err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
