// backend-api/index.js

require('dotenv').config(); // ✅ .env dosyasını yükle

const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const uploadMemory = require('./middleware/uploadMemory');  // Multer (MemoryStorage)
const cloudinary = require('./utils/cloudinary');            // Cloudinary yapılandırması

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3600;

// Middleware: JSON parse ve CORS izinleri
app.use(express.json());

app.use(
  cors({
    origin: [
      'https://frontend-app-opal-delta.vercel.app',
      'https://eminella.com',
      'https://www.eminella.com',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

// Yüklenen dosyalar için static dizin (şu an Cloudinary kullanılıyor ama ek olarak dursun)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth ve Sipariş route'ları
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Sağlık kontrolü
app.get('/', (_req, res) => {
  res.send('Eminella Backend API aktif ✅');
});

// Ürünleri getir
app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('❌ GET /api/products:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek ürün detay
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Geçersiz ID' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    res.json(product);
  } catch (err) {
    console.error(`❌ GET /api/products/${req.params.id}:`, err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni ürün ekle (Cloudinary + multer memory)
app.post('/api/products', uploadMemory.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice) || !category) {
      return res.status(400).json({ error: 'Geçersiz veri' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    // Cloudinary upload helper
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'eminella-products' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        category,
        imageUrl: result.secure_url,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('❌ POST /api/products:', err);
    console.error('🪵 Hata mesajı:', err.message);
    res.status(500).json({ error: err.message || 'Ürün eklenemedi' });
  }
});

// Global hata yakalayıcı (Render için loglara yansır)
app.use((err, req, res, next) => {
  console.error('🚨 GLOBAL ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Bilinmeyen sunucu hatası',
    stack: err.stack,
  });
});

// Sunucu başlat
app.listen(PORT, () => {
  console.log(`🚀 Backend ${PORT} portunda çalışıyor`);
});
