const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload'); // Multer config (görsel yükleme)

const app = express(); // Kesinlikle en başta olmalı
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3600;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'https://frontend-app-lbak.onrender.com',
    'https://eminella.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));


app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.send('Eminella Backend API aktif ✅');
});

// Ürün ekleme
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    const imageUrl = req.file.path;

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        imageUrl,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Ürün ekleme hatası:", error);
    res.status(500).json({ error: 'Ürün eklenemedi.' });
  }
});

// Ürün listele
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error("🔴 /products hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


// Sipariş oluşturma
app.post('/orders', async (req, res) => {
  try {
    const {
      customerName,
      address,
      phone,
      items,
      totalAmount,
      productIds
    } = req.body;

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
        products: {
          connect: productIds.map(id => ({ id }))
        }
      },
      include: {
        products: true,
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('❌ Sipariş oluşturma hatası:', error);
    res.status(500).json({ error: 'Sipariş oluşturulamadı.' });
  }
});

// Siparişleri listele
app.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { products: true }
    });
    res.json(orders);
  } catch (error) {
    console.error('❌ Siparişler alınamadı:', error);
    res.status(500).json({ error: 'Sipariş listesi alınamadı.' });
  }
});

// Sipariş durumu güncelleme
app.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status zorunlu' });

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ Sipariş durumu güncellenemedi:', error);
    res.status(500).json({ error: 'Durum güncelleme başarısız.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});

app.get('/', (req, res) => {
  res.send('✅ Backend ayakta!');
});
