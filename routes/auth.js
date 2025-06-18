const express = require('express');
const router = express.Router();

// .env dosyasını okuyalım
require('dotenv').config();

// Giriş (Login)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.cookie('admin-auth', 'true', {
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 1000, // 12 saat
    });
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: 'Hatalı bilgi' });
});

// Çıkış (Logout)
router.post('/logout', (req, res) => {
  res.clearCookie('admin-auth');
  return res.json({ success: true });
});

module.exports = router;
