const db = require("../config/db");
const ExcelJS = require("exceljs");

// Laporan total pendapatan per hari
exports.getDailyReport = (req, res) => {
  const sql = `
    SELECT 
      DATE(created_at) AS tanggal,
      type,
      SUM(total) AS total_pendapatan,
      COUNT(*) AS jumlah_transaksi
    FROM transactions
    GROUP BY tanggal, type
    ORDER BY tanggal DESC
  `;

  db.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil laporan", error: err });
    res.json(results);
  });
};

// Laporan pendapatan filter by tanggal (opsional)
exports.getReportByDate = (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res
      .status(400)
      .json({ message: "Tanggal wajib diisi (?date=YYYY-MM-DD)" });
  }

  const sql = `
    SELECT 
      type,
      SUM(total) AS total_pendapatan,
      COUNT(*) AS jumlah_transaksi
    FROM transactions
    WHERE DATE(created_at) = ?
    GROUP BY type
  `;

  db.query(sql, [date], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil laporan", error: err });
    res.json({ tanggal: date, data: results });
  });
};

// Laporan pendapatan per kasir
exports.getReportByCashier = (req, res) => {
  const sql = `
    SELECT 
      u.id AS user_id,
      u.name AS kasir,
      u.role,
      COUNT(t.id) AS jumlah_transaksi,
      SUM(t.total) AS total_pendapatan
    FROM users u
    JOIN transactions t ON u.id = t.user_id
    WHERE u.role IN ('kasir_tiket', 'kasir_kantin')
    GROUP BY u.id
    ORDER BY total_pendapatan DESC
  `;

  db.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil laporan kasir", error: err });
    res.json(results);
  });
};

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
