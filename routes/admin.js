// backend-api/routes/admin.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gizlikey';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Tüm alanlar zorunlu.' });
  }

  if (email !== 'admin@example.com') {
    return res.status(401).json({ error: 'Bu email için yetki yok.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: 'Şifre yanlış' });

    const token = jwt.sign({ id: user.id, role: 'admin' }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
