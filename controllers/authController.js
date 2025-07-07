const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  // Validasi input dasar
  if (!name || !username || !password || !role) {
    return res.status(400).json({ message: "Harap lengkapi semua data" });
  }

  // Cek apakah username sudah ada
  const checkUserQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkUserQuery, [username], async (err, results) => {
    if (err)
      return res.status(500).json({ message: "Server error", error: err });
    if (results.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user
    const insertUserQuery =
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)";
    db.query(
      insertUserQuery,
      [name, username, hashedPassword, role],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Gagal menyimpan user", error: err });

        res
          .status(201)
          .json({ message: "Registrasi berhasil", userId: result.insertId });
      }
    );
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err)
      return res.status(500).json({ message: "Server error", error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  });
};
