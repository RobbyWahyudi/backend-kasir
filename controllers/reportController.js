const db = require("../config/db");
const ExcelJS = require("exceljs");

// Dashboard ringkas
exports.getDashboardSummary = (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total_transaksi,
      SUM(total) AS total_pendapatan
    FROM transactions
    WHERE DATE(created_at) = CURDATE()
  `;

  const sqlByType = `
    SELECT 
      type,
      COUNT(*) AS jumlah_transaksi,
      SUM(total) AS total
    FROM transactions
    WHERE DATE(created_at) = CURDATE()
    GROUP BY type
  `;

  db.query(sql, (err, totalResult) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil ringkasan total", error: err });

    db.query(sqlByType, (err2, byTypeResult) => {
      if (err2)
        return res
          .status(500)
          .json({ message: "Gagal ambil ringkasan per jenis", error: err2 });

      res.json({
        tanggal: new Date().toISOString().slice(0, 10),
        total_transaksi: totalResult[0].total_transaksi,
        total_pendapatan: totalResult[0].total_pendapatan,
        transaksi_per_jenis: byTypeResult,
      });
    });
  });
};

// Export excel
exports.exportMonthlyReport = (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: "Harap isi ?month=7&year=2025" });
  }

  const sql = `
    SELECT 
      t.id AS transaksi_id,
      t.type,
      t.total,
      t.payment_method,
      t.created_at,
      u.name AS kasir
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    WHERE MONTH(t.created_at) = ? AND YEAR(t.created_at) = ?
    ORDER BY t.created_at ASC
  `;

  db.query(sql, [month, year], async (err, results) => {
    if (err)
      return res.status(500).json({ message: "Gagal ambil data", error: err });

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Laporan Bulanan");

    sheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "ID Transaksi", key: "transaksi_id", width: 15 },
      { header: "Tipe", key: "type", width: 12 },
      { header: "Total", key: "total", width: 15 },
      { header: "Metode Bayar", key: "payment_method", width: 15 },
      { header: "Tanggal", key: "created_at", width: 20 },
      { header: "Kasir", key: "kasir", width: 20 },
    ];

    results.forEach((item, index) => {
      sheet.addRow({
        no: index + 1,
        ...item,
      });
    });

    // Hitung total semua transaksi bulan itu
    const totalPendapatan = results.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );

    // Tambahkan baris kosong & baris total di bawahnya
    sheet.addRow({});
    sheet.addRow({
      type: "TOTAL",
      total: totalPendapatan,
    });

    // Set Header & kirim file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan_bulanan_${month}_${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });
};

// Total Pendapatan
exports.getSummary = (req, res) => {
  const sqlTotal = `
    SELECT 
      COUNT(*) AS total_transaksi,
      SUM(total) AS total_pendapatan
    FROM transactions
  `;

  const sqlByType = `
    SELECT 
      type,
      COUNT(*) AS jumlah_transaksi,
      SUM(total) AS total
    FROM transactions
    GROUP BY type
  `;

  db.query(sqlTotal, (err, totalResult) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil ringkasan total", error: err });

    db.query(sqlByType, (err2, byTypeResult) => {
      if (err2)
        return res
          .status(500)
          .json({ message: "Gagal ambil ringkasan per jenis", error: err2 });

      res.json({
        total_transaksi: totalResult[0].total_transaksi,
        total_pendapatan: totalResult[0].total_pendapatan,
        ringkasan_per_jenis: byTypeResult,
      });
    });
  });
};

// Rekap Harian
exports.getStokHarian = (req, res) => {
  const tanggal = req.query.date || new Date().toISOString().slice(0, 10); // default: hari ini

  const sql = `
    SELECT 
      p.id,
      p.name AS nama_barang,

      -- Stok masuk hari ini dari gudang
      IFNULL(SUM(st.quantity), 0) AS stok_masuk,

      -- Terjual hari ini
      (
        SELECT IFNULL(SUM(ti.quantity), 0)
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE DATE(t.created_at) = ? AND ti.item_type = 'product' AND ti.item_id = p.id
      ) AS terjual,

      -- Sisa stok saat ini
      p.stock_kantin AS sisa_stok

    FROM products p
    LEFT JOIN stock_transfers st ON st.product_id = p.id AND DATE(st.created_at) = ?
    GROUP BY p.id
  `;

  db.query(sql, [tanggal, tanggal], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil data stok harian", error: err });

    // Hitung stok_awal dan jumlah_stok
    const rekap = results.map((row) => {
      const stok_awal =
        row.sisa_stok + Number(row.terjual) - Number(row.stok_masuk);
      const jumlah_stok = stok_awal + Number(row.stok_masuk);

      return {
        nama_barang: row.nama_barang,
        stok_awal,
        stok_masuk: Number(row.stok_masuk),
        jumlah_stok,
        terjual: Number(row.terjual),
        sisa_stok: row.sisa_stok,
      };
    });

    res.json({ tanggal, data: rekap });
  });
};

// Eksport Rekap Harian
exports.exportStokHarian = async (req, res) => {
  const tanggal = req.query.date || new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT 
      p.id,
      p.name AS nama_barang,
      IFNULL(SUM(st.quantity), 0) AS stok_masuk,
      (
        SELECT IFNULL(SUM(ti.quantity), 0)
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE DATE(t.created_at) = ? AND ti.item_type = 'product' AND ti.item_id = p.id
      ) AS terjual,
      p.stock_kantin AS sisa_stok
    FROM products p
    LEFT JOIN stock_transfers st ON st.product_id = p.id AND DATE(st.created_at) = ?
    GROUP BY p.id
  `;

  db.query(sql, [tanggal, tanggal], async (err, results) => {
    if (err)
      return res.status(500).json({ message: "Gagal ambil data", error: err });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Rekap Stok ${tanggal}`);

    sheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Barang", key: "nama_barang", width: 25 },
      { header: "Stok Awal", key: "stok_awal", width: 12 },
      { header: "Stok Masuk", key: "stok_masuk", width: 12 },
      { header: "Jumlah Stok", key: "jumlah_stok", width: 15 },
      { header: "Terjual", key: "terjual", width: 12 },
      { header: "Sisa Stok", key: "sisa_stok", width: 12 },
    ];

    results.forEach((item, index) => {
      const stokMasuk = Number(item.stok_masuk);
      const terjual = Number(item.terjual);
      const sisa = Number(item.sisa_stok);

      const stokAwal = sisa + terjual - stokMasuk;
      const jumlahStok = stokAwal + stokMasuk;

      sheet.addRow({
        no: index + 1,
        nama_barang: item.nama_barang,
        stok_awal: stokAwal,
        stok_masuk: stokMasuk,
        jumlah_stok: jumlahStok,
        terjual: terjual,
        sisa_stok: sisa,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rekap_stok_${tanggal}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });
};

exports.getDailyIncomeByCashier = (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const user_id = req.query.user_id; // optional

  let sql = `
    SELECT 
      u.id AS kasir_id,
      u.name AS nama_kasir,
      COUNT(t.id) AS jumlah_transaksi,
      IFNULL(SUM(t.total), 0) AS total_pemasukan
    FROM transactions t
    JOIN users u ON u.id = t.user_id
    WHERE DATE(t.created_at) = ?
  `;

  const params = [date];

  if (user_id) {
    sql += " AND u.id = ?";
    params.push(user_id);
  }

  sql += " GROUP BY u.id, u.name";

  db.query(sql, params, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil data kasir", error: err });

    const pemasukan = results.reduce(
      (sum, row) => sum + Number(row.total_pemasukan),
      0
    );

    // Query pengeluaran harian
    const pengeluaranQuery = `
      SELECT IFNULL(SUM(amount), 0) AS pengeluaran
      FROM expenses
      WHERE DATE(created_at) = ?
    `;

    db.query(pengeluaranQuery, [date], (err2, pengeluaranResult) => {
      if (err2)
        return res
          .status(500)
          .json({ message: "Gagal mengambil pengeluaran", error: err2 });

      const pengeluaran = Number(pengeluaranResult[0].pengeluaran);
      const total = pemasukan - pengeluaran;

      res.json({
        tanggal: date,
        pengeluaran,
        pemasukan,
        total,
        data: results,
      });
    });
  });
};

// exports.getDailyIncomeByCashier = (req, res) => {
//   const date = req.query.date || new Date().toISOString().slice(0, 10);
//   const user_id = req.query.user_id; // optional

//   let sql = `
//     SELECT
//       u.id AS kasir_id,
//       u.name AS nama_kasir,
//       COUNT(t.id) AS jumlah_transaksi,
//       IFNULL(SUM(t.total), 0) AS total_pemasukan
//     FROM transactions t
//     JOIN users u ON u.id = t.user_id
//     WHERE DATE(t.created_at) = ?
//   `;

//   const params = [date];

//   if (user_id) {
//     sql += " AND u.id = ?";
//     params.push(user_id);
//   }

//   sql += " GROUP BY u.id, u.name";

//   db.query(sql, params, (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ message: "Gagal mengambil data kasir", error: err });

//     res.json({
//       tanggal: date,
//       data: results,
//     });
//   });
// };

// Laporan total pendapatan per hari
// exports.getDailyReport = (req, res) => {
//   const sql = `
//     SELECT
//       DATE(created_at) AS tanggal,
//       type,
//       SUM(total) AS total_pendapatan,
//       COUNT(*) AS jumlah_transaksi
//     FROM transactions
//     GROUP BY tanggal, type
//     ORDER BY tanggal DESC
//   `;

//   db.query(sql, (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ message: "Gagal mengambil laporan", error: err });
//     res.json(results);
//   });
// };

// Laporan pendapatan filter by tanggal (opsional)
// exports.getReportByDate = (req, res) => {
//   const { date } = req.query;

//   if (!date) {
//     return res
//       .status(400)
//       .json({ message: "Tanggal wajib diisi (?date=YYYY-MM-DD)" });
//   }

//   const sql = `
//     SELECT
//       type,
//       SUM(total) AS total_pendapatan,
//       COUNT(*) AS jumlah_transaksi
//     FROM transactions
//     WHERE DATE(created_at) = ?
//     GROUP BY type
//   `;

//   db.query(sql, [date], (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ message: "Gagal mengambil laporan", error: err });
//     res.json({ tanggal: date, data: results });
//   });
// };

// Laporan pendapatan per kasir
// exports.getReportByCashier = (req, res) => {
//   const sql = `
//     SELECT
//       u.id AS user_id,
//       u.name AS kasir,
//       u.role,
//       COUNT(t.id) AS jumlah_transaksi,
//       SUM(t.total) AS total_pendapatan
//     FROM users u
//     JOIN transactions t ON u.id = t.user_id
//     WHERE u.role IN ('kasir_tiket', 'kasir_kantin')
//     GROUP BY u.id
//     ORDER BY total_pendapatan DESC
//   `;

//   db.query(sql, (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ message: "Gagal mengambil laporan kasir", error: err });
//     res.json(results);
//   });
// };
