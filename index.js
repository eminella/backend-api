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
    console.error(error); // ← Objenin tamamı
    res.status(500).json({ error: 'Ürün eklenemedi.' });
  }
});
