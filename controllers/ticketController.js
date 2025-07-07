const db = require("../config/db");

// Ambil semua tiket
exports.getAllTickets = (req, res) => {
  db.query("SELECT * FROM tickets", (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil data tiket", error: err });
    res.json(results);
  });
};

// Tambah tiket baru
exports.createTicket = (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res
      .status(400)
      .json({ message: "Nama dan harga tiket wajib diisi" });
  }

  const sql = "INSERT INTO tickets (name, price) VALUES (?, ?)";
  db.query(sql, [name, price], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menambahkan tiket", error: err });

    res
      .status(201)
      .json({
        message: "Tiket berhasil ditambahkan",
        ticketId: result.insertId,
      });
  });
};

// Update tiket
exports.updateTicket = (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  const sql = "UPDATE tickets SET name = ?, price = ? WHERE id = ?";
  db.query(sql, [name, price, id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengupdate tiket", error: err });

    res.json({ message: "Tiket berhasil diupdate" });
  });
};

// Hapus tiket
exports.deleteTicket = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM tickets WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menghapus tiket", error: err });

    res.json({ message: "Tiket berhasil dihapus" });
  });
};
