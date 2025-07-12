const db = require("../config/db");

exports.createExpense = (req, res) => {
  const { description, amount } = req.body;

  if (!description || !amount) {
    return res
      .status(400)
      .json({ message: "Deskripsi dan jumlah pengeluaran wajib diisi" });
  }

  const sql = `INSERT INTO expenses (description, amount) VALUES (?, ?)`;
  db.query(sql, [description, amount], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menambahkan pengeluaran", error: err });

    res.status(201).json({
      message: "Pengeluaran berhasil ditambahkan",
      id: result.insertId,
    });
  });
};
