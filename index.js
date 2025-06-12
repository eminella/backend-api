app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const parsedPrice = parseFloat(price);

    if (!name || isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Geçersiz isim veya fiyat' });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    const imageUrl = req.file.path; // ✅ Cloudinary URL burada zaten

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
