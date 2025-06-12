console.log("🚨 BU DOSYA GÜNCELLENDİ – TEST!");

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3600;

app.use(cors());
app.use(express.json());

/* 📦 Ürün Listele */
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    console.log('BODY:', JSON.stringify(req.body, null, 2));
    console.log('FILE:', req.file);

    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });

    }

    console.log(JSON.stringify(data, null, 2));


    const imageUrl = req.file?.path || null;

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        imageUrl,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ HATA:", JSON.stringify(error, null, 2));
  }
  
});


/* ➕ Ürün Ekle (Cloudinary + FormData) */
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });
    }

    const imageUrl = req.file?.path || null;

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        imageUrl,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ HATA:", JSON.stringify(error, null, 2));
  }
  
});

/* ❌ Ürün Sil */
app.delete('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Ürün silindi' });
  } catch (error) {
    console.error("❌ HATA:", JSON.stringify(error, null, 2));
  }
  
});

/* 🛒 Sipariş Listele */
app.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (error) {
    console.error("❌ HATA:", JSON.stringify(error, null, 2));
  }
  
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
  }  catch (error) {
    console.error("❌ HATA:", JSON.stringify(error, null, 2));
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
  }catch (error) {
    console.error("❌ HATA:", JSON.stringify(error, null, 2));
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
    console.error('Sipariş detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
