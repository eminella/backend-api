// backend-api/routes/order.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// GET /api/orders
router.get('/', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { products: true },  // ürün detaylarını da getir
    });
    res.json(orders);
  } catch (err) {
    console.error('[GET /orders]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, customerName, address, phone } = req.body;
    const order = await prisma.order.create({
      data: {
        items,
        totalAmount,
        customerName: customerName || null,
        address: address || null,
        phone: phone || null,
        products: {
          connect: items.map(p => ({ id: p.id })),
        },
      },
      include: { products: true },
    });
    res.status(201).json(order);
  } catch (err) {
    console.error('[POST /orders]', err);
    res.status(400).json({ error: 'Sipariş oluşturulamadı.' });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { products: true },
    });
    res.json(order);
  } catch (err) {
    console.error('[PATCH /orders/:id/status]', err);
    res.status(400).json({ error: 'Durum güncellenemedi.' });
  }
});

module.exports = router;
