const express = require('express');
const cors = require('cors');

app.use(cors({
  origin: '*', // veya frontend URL'n tam haliyle: 'https://frontend-app-lbak.onrender.com'
  credentials: true,
}));

const { PrismaClient } = require('@prisma/client');
const upload = require('./middleware/upload'); // Multer config

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3600;

const corsOptions = {
  origin: 'https://frontend-app-lbak.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));


// ✅ Test route
app.get('/', (req, res) => {
  res.send('✅ API çalışıyor');
});

// ✅ ÜRÜN EKLE
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });
    }

    if (!req.file || !req.file.path) {
      console.error("❌ Dosya yüklenemedi veya req.file.path boş");
      return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    console.log("✅ Dosya Yüklendi:", req.file);

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
    console.error("❌ ÜRÜN EKLEME HATASI:");
    console.error("Hata tipi:", error?.name);
    console.error("Hata mesajı:", error?.message);
    console.error("Stack:", error?.stack);
    res.status(500).json({ error: 'Ürün eklenemedi.' });
  }
  
  
});

// ✅ ÜRÜN LİSTELE
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürünler alınamadı' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
