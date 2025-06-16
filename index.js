const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload'); // Multer config (görsel yükleme)
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3600;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'https://frontend-app-opal-delta.vercel.app',
    'https://eminella.com',
    'https://www.eminella.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1) Test route
app.get('/', (req, res) => {
  res.send('Eminella Backend API aktif ✅');
});

// 2) Tüm ürünleri listeleme
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.json(products);
  } catch (error) {
    console.error('❌ GET /products hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 3) Yeni ürün ekleme
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const parsedPrice = parseFloat(price);
    if (!name || isNaN(parsedPrice) || !category) {
      return res.status(400).json({ error: 'Geçersiz isim, fiyat veya kategori' });
    }
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    const imageUrl = `/uploads/${path.basename(req.file.path)}`;
    const product = await prisma.product.create({
      data: { name, price: parsedPrice, category, imageUrl },
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error('❌ POST /products hatası:', error);
    return res.status(500).json({ error: 'Ürün eklenemedi.' });
  }
});

// 4) Tek bir ürünü id ile getiren rota
app.get('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Geçersiz ürün ID' });
  }
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    return res.json(product);
  } catch (err) {
    console.error('❌ GET /products/:id hatası:', err);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 5) Sipariş oluşturma
app.post('/orders', async (req, res) => {
  try {
    const { customerName, address, phone, items, totalAmount, productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Ürün listesi boş olamaz.' });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        address,
        phone,
        items,
        totalAmount,
        products: { connect: productIds.map(id => ({ id })) }
      },
      include: { products: true }
    });
    return res.status(201).json(order);
  } catch (error) {
    console.error('❌ POST /orders hatası:', error);
    return res.status(500).json({ error: 'Sipariş oluşturulamadı.' });
  }
});

// 6) Siparişleri listele
app.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { products: true }
    });
    return res.json(orders);
  } catch (error) {
    console.error('❌ GET /orders hatası:', error);
    return res.status(500).json({ error: 'Sipariş listesi alınamadı.' });
  }
});

// 7) Sipariş durumu güncelleme
app.patch('/orders/:id/status', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status zorunlu' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    return res.json(updatedOrder);
  } catch (error) {
    console.error('❌ PATCH /orders/:id/status hatası:', error);
    return res.status(500).json({ error: 'Durum güncelleme başarısız.' });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
