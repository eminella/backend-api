const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, customerName, address, phone } = req.body;

    const order = await prisma.order.create({
      data: {
        items,
        totalAmount,
        customerName,
        address,
        phone,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('🚨 Sipariş Hatası:', error);
    res.status(500).json({ error: 'Sipariş oluşturulamadı.' });
  }
});

module.exports = router;
