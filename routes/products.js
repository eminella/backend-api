const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Ürün listesi
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ürün detayı
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Geçersiz ID' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });

    res.json(product);
  } catch (err) {
    console.error(`GET /api/products/${req.params.id}:`, err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
