// backend-api/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload');      // Multer
const orderRoutes = require('./routes/routes/order');      // ⬅️ Sipariş rotaları

const app    = express();
const prisma = new PrismaClient();
const PORT   = process.env.PORT || 3600;

/* ----------  MIDDLEWARE  ---------- */
app.use(express.json());

app.use(
  cors({
    origin: [
      'https://frontend-app-opal-delta.vercel.app',
      'https://eminella.com',
      'https://www.eminella.com',
      'http://localhost:3000',
      'http://localhost:4000',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ----------  TEST  ---------- */
app.get('/', (_req, res) => {
  res.send('Eminella Backend API aktif ✅');
});

/* ----------  PRODUCT ENDPOINT’LERİ  ---------- */

// Tüm ürünler
app.get('/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('GET /products:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni ürün ekle
app.post('/products', upload.single('image'), async (req, res) => {
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
    console.error('POST /products:', err);
    res.status(500).json({ error: 'Ürün eklenemedi' });
  }
});

// ID ile ürün
app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Geçersiz ürün ID' });

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(product);
  } catch (err) {
    console.error('GET /products/:id:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/* ----------  ORDER ENDPOINT’LERİ  ---------- */
// /orders altında tüm POST–GET–PATCH işlemleri routes/order.js’te
app.use('/orders', orderRoutes);

/* ----------  SERVER BAŞLAT  ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Backend ${PORT} portunda çalışıyor`);
});
