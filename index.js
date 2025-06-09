const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 10000)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/* 📦 Ürün Listele */
app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

/* ➕ Ürün Ekle (FormData ve Resimli) */
app.post('/products', upload.single("image"), async (req, res) => {
  console.log("🎯 Gelen form:", req.body);
  console.log("📸 Gelen dosya:", req.file);

  try {
    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || isNaN(parsedPrice)) {
      console.log("❌ Geçersiz veri:", { name, price });
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        imageUrl,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Sunucu hatası:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

/* ❌ Ürün Sil */
app.delete('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Ürün silindi' });
  } catch (error) {
    console.error("❌ Silme hatası:", error);
    res.status(500).json({ error: 'Silme hatası' });
  }
});

/* 🛒 Sipariş Listele */
app.get('/orders', async (req, res) => {
  const orders = await prisma.order.findMany();
  res.json(orders);
});

/* ➕ Yeni Sipariş Oluştur */
app.post('/orders', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !totalAmount) {
      return res.status(400).json({ error: 'Eksik sipariş bilgisi' });
    }

    const order = await prisma.order.create({
      data: {
        items,
        totalAmount,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

/* 🔄 Sipariş Durumu Güncelle */
app.put('/orders/:id/status', async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

/* 📝 Sipariş Detay Getir */
app.get('/orders/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
