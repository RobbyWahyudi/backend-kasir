const db = require("../config/db");

// Buat transaksi baru
exports.createTransaction = (req, res) => {
  const { type, payment_method, items } = req.body;
  const user_id = req.user.id; // dari token
  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "Item transaksi tidak boleh kosong" });
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const transactionQuery = `
    INSERT INTO transactions (user_id, type, total, payment_method)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    transactionQuery,
    [user_id, type, total, payment_method],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal menyimpan transaksi", error: err });

      const transaction_id = result.insertId;

      // Siapkan item
      const itemData = items.map((item) => [
        transaction_id,
        item.item_id,
        item.item_type,
        item.name,
        item.quantity,
        item.price,
        item.quantity * item.price,
      ]);

      const itemQuery = `
      INSERT INTO transaction_items
      (transaction_id, item_id, item_type, item_name, quantity, price, subtotal)
      VALUES ?
    `;

      db.query(itemQuery, [itemData], (err2) => {
        if (err2)
          return res
            .status(500)
            .json({ message: "Gagal menyimpan detail item", error: err2 });

        // Kurangi stok produk jika item_type = 'product'
        if (type === "kantin" || type === "pelampung") {
          items.forEach((item) => {
            if (item.item_type === "product") {
              const updateStockQuery =
                "UPDATE products SET stock_kantin = stock_kantin - ? WHERE id = ?";
              db.query(updateStockQuery, [item.quantity, item.item_id]);
            }
          });
        }

        res.status(201).json({ message: "Transaksi berhasil", transaction_id });
      });
    }
  );
};

// Ambil riwayat transaksi berdasarkan user login
// exports.getMyTransactions = (req, res) => {
//   const userId = req.user.id;

//   const sql = `
//     SELECT
//       t.id AS transaction_id,
//       t.type,
//       t.total,
//       t.payment_method,
//       t.created_at,
//       ti.item_name,
//       ti.quantity,
//       ti.price,
//       ti.subtotal
//     FROM transactions t
//     JOIN transaction_items ti ON t.id = ti.transaction_id
//     WHERE t.user_id = ?
//     ORDER BY t.created_at DESC
//   `;

//   db.query(sql, [userId], (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ message: "Gagal mengambil riwayat", error: err });

//     res.json(results);
//   });
// };
