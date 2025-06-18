import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Ürün listesi
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// Ürün detayı
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Geçersiz ID' });
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
  res.json(product);
});

export default router;

