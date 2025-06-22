require('dotenv').config();               // .env

const express       = require('express');
const cors          = require('cors');
const path          = require('path');
const { PrismaClient } = require('@prisma/client');

const uploadCloudinary = require('./middleware/uploadCloudinary'); // 👈
const authRoutes    = require('./routes/auth');
const orderRoutes   = require('./routes/order');

const app    = express();
const prisma = new PrismaClient();
const PORT   = process.env.PORT || 3600;

// JSON + CORS
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

// Statik uploads (gerektiğinde)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);

// Sağlık testi
app.get('/', (_req, res) => res.send('Eminella Backend API aktif ✅'));

// Liste
app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('❌ GET /api/products:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Detay
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

// ➡️ Yeni ürün ekle (CloudinaryStorage ile)
app.post('/api/products', uploadCloudinary.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice) || !category)
      return res.status(400).json({ error: 'Geçersiz veri' });

    if (!req.file || !req.file.path)
      return res.status(400).json({ error: 'Görsel yüklenemedi' });

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        category,
        imageUrl: req.file.path,  // Cloudinary URL
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('❌ POST /api/products:', err);
    res.status(500).json({ error: err.message || 'Ürün eklenemedi' });
  }
});

// Global error
app.use((err, _req, res, _next) => {
  console.error('🚨 GLOBAL ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Bilinmeyen sunucu hatası',
    stack: err.stack,
  });
});

app.listen(PORT, () => console.log(`🚀 Backend ${PORT} portunda çalışıyor`));
