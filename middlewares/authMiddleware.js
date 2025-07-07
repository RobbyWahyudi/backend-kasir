const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Pastikan header Authorization ada dan dimulai dengan 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1]; // Ambil token-nya saja

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user dari token ke request
    next(); // Lanjut ke controller
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid" });
  }
};
