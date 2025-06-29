// backend-api/routes/admin.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'gizlikey';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Tüm alanlar zorunlu.' });

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
  }

  const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, {
    expiresIn: '1d',
  });

  res.json({ token });
});

module.exports = router;
