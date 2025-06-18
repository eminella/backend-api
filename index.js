// backend-api/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload');      // multer config’in
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');      // routes/order.js

const app    = express();
const prisma = new PrismaClient();
const PORT   = process.env.PORT || 3600;

/* ---------- MIDDLEWARE ---------- */
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------- AUTH ---------- */
app.use('/api/auth', authRoutes);

/* ---------- HEALTH CHECK ---------- */
app.get('/', (_req, res) => {
  res.send('Eminella Backend API aktif ✅');
});

/* ---------- PRODUCT ENDPOINTS ---------- */
// 1) Ürün listesi
app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 2) Ürün detayı
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Geçersiz ID' });

    const product = await prisma.product.findUnique({
      where: { id }
    });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    res.json(product);
  } catch (err) {
    console.error(`GET /api/products/${req.params.id}:`, err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 3) Ürün ekleme (upload destekli)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const parsedPrice = parseFloat(price);
    if (!name || isNaN(parsedPrice) || !category)
      return res.status(400).json({ error: 'Geçersiz veri' });
    if (!req.file?.path)
      return res.status(400).json({ error: 'Görsel yüklenemedi' });

    const imageUrl = `/uploads/${path.basename(req.file.path)}`;
    const product  = await prisma.product.create({
      data: { name, price: parsedPrice, category, imageUrl },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products:', err);
    res.status(500).json({ error: 'Ürün eklenemedi' });
  }
});

/* ---------- ORDER ENDPOINTS ---------- */
app.use('/api/orders', orderRoutes);

/* ---------- SERVER START ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Backend ${PORT} portunda çalışıyor`);
});
