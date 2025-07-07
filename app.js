const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Backend Kasir Desa Gagah aktif");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
