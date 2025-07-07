-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 07, 2025 at 07:19 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kasir-app`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('makanan','minuman','pelampung') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `stock`, `created_at`) VALUES
(1, 'Teh Botol', 'minuman', '6000.00', 15, '2025-07-05 13:32:21'),
(2, 'Air Mineral', 'minuman', '3000.00', 47, '2025-07-06 13:54:01'),
(3, 'Mie Goreng', 'makanan', '6000.00', 12, '2025-07-06 13:54:37');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `name`, `price`, `created_at`) VALUES
(2, 'Tiket Masuk', '10000.00', '2025-07-06 06:21:32');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('tiket','kantin','pelampung') NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('tunai','qris','lainnya') DEFAULT 'tunai',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `total`, `payment_method`, `created_at`) VALUES
(1, 1, 'tiket', '16000.00', 'tunai', '2025-07-05 13:44:39'),
(2, 1, 'kantin', '12000.00', 'qris', '2025-07-06 00:32:24'),
(3, 1, 'kantin', '12000.00', 'qris', '2025-07-06 00:36:25'),
(4, 1, 'kantin', '30000.00', 'qris', '2025-07-06 00:48:41'),
(5, 1, 'kantin', '30000.00', 'qris', '2025-07-06 04:44:48'),
(6, 2, 'tiket', '20000.00', 'tunai', '2025-07-06 06:24:56'),
(7, 2, 'tiket', '20000.00', 'tunai', '2025-07-06 06:27:27'),
(8, 1, 'kantin', '27000.00', 'tunai', '2025-07-06 13:56:54');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int NOT NULL,
  `transaction_id` int NOT NULL,
  `item_id` int NOT NULL,
  `item_type` enum('product','ticket') NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `item_id`, `item_type`, `item_name`, `quantity`, `price`, `subtotal`) VALUES
(1, 1, 1, 'ticket', 'Tiket Masuk Anak-anak', 2, '8000.00', '16000.00'),
(2, 2, 2, 'product', 'Teh Botol', 2, '6000.00', '12000.00'),
(3, 3, 2, 'product', 'Teh Botol', 2, '6000.00', '12000.00'),
(4, 4, 1, 'product', 'Teh Botol', 5, '6000.00', '30000.00'),
(5, 5, 1, 'product', 'Teh Botol', 5, '6000.00', '30000.00'),
(6, 6, 1, 'ticket', 'Tiket Masuk', 2, '10000.00', '20000.00'),
(7, 7, 2, 'ticket', 'Tiket Masuk', 2, '10000.00', '20000.00'),
(8, 8, 2, 'product', 'Air Mineral', 3, '3000.00', '9000.00'),
(9, 8, 3, 'product', 'Mie Goreng', 3, '6000.00', '18000.00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('kepala_desa','admin','kasir_tiket','kasir_kantin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'admin', '$2a$12$JuAFh/I1qrQOiu/EG7hMjePG2GEeIey12u8coc5T9cSZgSFtAm8f6', 'admin', '2025-07-05 07:47:22'),
(2, 'Kasir Tiket', 'kasirtiket', '$2a$12$nCR.OLSL7K1/LsBQLOvVpOdspM.9imUKfSSxB8fO6m2VwMuDOwBXO', 'kasir_tiket', '2025-07-06 04:53:03'),
(3, 'Kasir Kantin', 'kasirkantin', '$2b$10$t30LjSe4DsKyWsp34MbPVurljvbRV5J78dNm.w155TIXRfoabuXSm', 'kasir_kantin', '2025-07-06 10:12:36'),
(4, 'Kepala Desa', 'kepaladesa', '$2b$10$yvenIdyIFOZQTSRVBNfx6.jt3V2SmPVkSC1k1jAefwX22I19t/a8u', 'kepala_desa', '2025-07-06 10:14:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
