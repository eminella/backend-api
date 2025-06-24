const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Görselin kaydedileceği yer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // klasör adı
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📌 [POST] Yeni ürün ekleme (çoklu görsel destekli)
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

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
    res.status(500).json({ error: 'Ürün eklenirken hata oluştu' });
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
