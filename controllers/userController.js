const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET all users
exports.getAllUsers = (req, res) => {
  db.query("SELECT id, name, username, role FROM users", (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil data user", error: err });
    res.json(results);
  });
};

// GET single user
exports.getUserById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT id, name, username, role FROM users WHERE id = ?",
    [id],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengambil user", error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });
      res.json(results[0]);
    }
  );
};

// POST - create new user
exports.createUser = async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ message: "Semua data wajib diisi" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const sql =
    "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, username, hashedPassword, role], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal menambahkan user", error: err });
    res
      .status(201)
      .json({ message: "User berhasil ditambahkan", userId: result.insertId });
  });
};

// PUT - update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role } = req.body;

  const fields = [];
  const values = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }
  if (username) {
    fields.push("username = ?");
    values.push(username);
  }
  if (role) {
    fields.push("role = ?");
    values.push(role);
  }
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    fields.push("password = ?");
    values.push(hashed);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Tidak ada data untuk diperbarui" });
  }

  values.push(id); // untuk WHERE

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  db.query(sql, values, (err) => {
    if (err)
      return res.status(500).json({ message: "Gagal update user", error: err });
    res.json({ message: "User berhasil diupdate" });
  });
};

// DELETE user
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Gagal hapus user", error: err });
    res.json({ message: "User berhasil dihapus" });
  });
};
