console.log("🚨 BU DOSYA GÜNCELLENDİ – TEST!");

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload');
const cloudinary = require('./utils/cloudinary');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Ürün Ekle (Cloudinary ile)
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });
    }

    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eminella-products',
      });

      imageUrl = result.secure_url;

      // Lokal dosyayı sil
      fs.unlinkSync(req.file.path);
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
    console.error("❌ ÜRÜN EKLEME HATASI:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({ error: 'Ürün eklenemedi.' });
  }
});

// ✅ Ürün Listele
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'desc' } });
    res.json(products);
  } catch (error) {
    console.error("❌ ÜRÜN GETİRME HATASI:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Ürünler getirilemedi.' });
  }
});

// ✅ Ürün Sil
app.delete('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Ürün silindi' });
  } catch (error) {
    console.error("❌ ÜRÜN SİLME HATASI:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Silinemedi' });
  }
});

// ✅ Sipariş Listele
app.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (error) {
    console.error("❌ SİPARİŞ GETİRME HATASI:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Siparişler getirilemedi.' });
  }
});

// ✅ Sipariş Oluştur
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
    console.error("❌ SİPARİŞ EKLEME HATASI:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Sipariş oluşturulamadı.' });
  }
});

// ✅ Sipariş Detay
app.get('/orders/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });
    res.json(order);
  } catch (error) {
    console.error("❌ SİPARİŞ DETAY HATASI:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Detay getirilemedi.' });
  }
});

// ✅ Sipariş Durumu Güncelle
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
    console.error("❌ SİPARİŞ DURUM GÜNCELLEME HATASI:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Güncelleme başarısız.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
