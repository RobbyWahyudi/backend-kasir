const db = require("../config/db");

// Ambil semua produk
exports.getAllProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil data", error: err });
    res.json(results);
  });
};

// Tambah produk baru
exports.createProduct = (req, res) => {
  const { name, category, price, stock } = req.body;

  if (!name || !category || !price) {
    return res
      .status(400)
      .json({ message: "Nama, kategori, dan harga wajib diisi" });
  }

  const sql =
    "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, category, price, stock || 0], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menambahkan produk", error: err });

    res
      .status(201)
      .json({
        message: "Produk berhasil ditambahkan",
        productId: result.insertId,
      });
  });
};

// Update produk
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock } = req.body;

  const sql =
    "UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?";
  db.query(sql, [name, category, price, stock, id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengupdate produk", error: err });

    res.json({ message: "Produk berhasil diupdate" });
  });
};

// Hapus produk
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menghapus produk", error: err });

    res.json({ message: "Produk berhasil dihapus" });
  });
};
