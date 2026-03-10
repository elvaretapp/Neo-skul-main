-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 10 Mar 2026 pada 16.01
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `neo-skul`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `image`) VALUES
(1, 'Teknologi', 'teknologi', NULL),
(2, 'Sains', 'sains', NULL),
(3, 'Matematika', 'matematika', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `image` varchar(255) DEFAULT NULL,
  `type` enum('course','ebook','vr','game') DEFAULT 'course',
  `category_id` int(11) DEFAULT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `link` text DEFAULT NULL,
  `drive_link` varchar(500) DEFAULT NULL,
  `wa_group` varchar(500) DEFAULT NULL,
  `wa_mentor` varchar(500) DEFAULT NULL,
  `schedule_days` varchar(255) DEFAULT NULL COMMENT 'Contoh: Senin,Rabu,Jumat',
  `schedule_time` varchar(50) DEFAULT NULL COMMENT 'Contoh: 08:00 - 10:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `price`, `image`, `type`, `category_id`, `mentor_id`, `created_at`, `link`, `drive_link`, `wa_group`, `wa_mentor`, `schedule_days`, `schedule_time`) VALUES
(1, 'Grammar Mastery: Panduan Lengkap Tata Bahasa Inggris', 'Ebook interaktif yang membahas tata bahasa Inggris secara lengkap dari dasar hingga mahir. Dilengkapi contoh kalimat, latihan soal, dan tips praktis untuk meningkatkan kemampuan grammar sehari-hari. Cocok untuk pelajar SMP, SMA, maupun umum.', 150000.00, '/assets/images/products/1772468697_Elevate With Tech Solutions!.jpg', 'ebook', 1, NULL, '2026-02-07 15:51:29', NULL, 'https://drive.google.com/drive/folders/1ML5lk9fQay2tfD2d9o3HO09SHHdWn9m6?usp=drive_link', '', '', '', ''),
(2, 'VR Explore: Dunia Jaringan Komputer', 'Pengalaman belajar jaringan komputer secara immersive menggunakan teknologi Virtual Reality. Siswa dapat melihat langsung cara kerja router, server, dan koneksi internet dalam lingkungan 3D yang interaktif dan menyenangkan.\r\n', 199998.00, '/assets/images/products/1772468571_open book with pages.jpg', 'vr', 3, NULL, '2026-02-07 15:51:29', NULL, 'https://drive.google.com/drive/folders/1ML5lk9fQay2tfD2d9o3HO09SHHdWn9m6?usp=drive_link', '', '', '', ''),
(12, 'Teknologi Informasi dan Komunikasi', '....', 250000.00, '/assets/images/products/1772431234_Internet do coisas tecnologia refere para a integrado rede do interligado dispositivos e auxiliar t.jpg', 'course', NULL, 15, '2026-02-28 14:53:20', NULL, '', 'https://chat.whatsapp.com/BWROjgyoXJq6FDBy2LMOKf?mode=gi_t', '', '{\"Senin\":{\"mulai\":\"08:00\",\"selesai\":\"10:00\"},\"Rabu\":{\"mulai\":\"12:00\",\"selesai\":\"15:00\"}}', ''),
(14, 'TIK Kreatif: Literasi Digital untuk Pelajar', 'Kursus teknologi informasi dan komunikasi yang mengajarkan keterampilan digital esensial mulai dari pengolah kata, spreadsheet, presentasi digital, hingga keamanan internet. Dibimbing langsung oleh mentor lulusan UNAIR dengan pendekatan project-based learning', 174998.00, '/assets/images/products/1772437720_tik.jpg', 'course', NULL, 15, '2026-03-02 07:48:03', NULL, '', 'https://chat.whatsapp.com/BWROjgyoXJq6FDBy2LMOKf?mode=gi_t', 'https://wa.me/62881026478162', '{\"Rabu\":{\"mulai\":\"09:00\",\"selesai\":\"10:00\"},\"Sabtu\":{\"mulai\":\"18:00\",\"selesai\":\"19:30\"}}', ''),
(15, 'English Speaking Club: Lancar Berbicara Bahasa Inggris', 'Kursus intensif untuk meningkatkan kemampuan berbicara bahasa Inggris dengan percaya diri. Materi meliputi pronunciation, conversation practice, dan daily English. Pendekatan interaktif dengan simulasi percakapan nyata.', 130000.00, '/assets/images/products/1772468080_download (4).jpg', 'course', NULL, 22, '2026-03-02 16:14:41', NULL, '', 'https://chat.whatsapp.com/BWROjgyoXJq6FDBy2LMOKf?mode=gi_t', 'https://wa.me/62881026478162', '{\"Rabu\":{\"mulai\":\"09:00\",\"selesai\":\"10:00\"},\"Senin\":{\"mulai\":\"08:00\",\"selesai\":\"08:45\"},\"Kamis\":{\"mulai\":\"13:15\",\"selesai\":\"14:00\"}}', ''),
(16, 'English for Beginners: Belajar Bahasa Inggris dari Nol', 'Kursus bahasa Inggris dasar untuk pemula yang ingin memulai belajar dari awal. Materi mencakup kosakata dasar, grammar sederhana, dan percakapan sehari-hari yang praktis dan mudah dipahami.\r\n', 100000.00, '/assets/images/products/1772468161_Эффективные техники для успешного обучения и самосоверш.jpg', 'course', NULL, 22, '2026-03-02 16:16:01', NULL, '', 'https://chat.whatsapp.com/BWROjgyoXJq6FDBy2LMOKf?mode=gi_t', 'https://wa.me/62881026478162', '{\"Senin\":{\"mulai\":\"08:00\",\"selesai\":\"10:00\"},\"Jumat\":{\"mulai\":\"10:00\",\"selesai\":\"12:00\"}}', '');

-- --------------------------------------------------------

--
-- Struktur dari tabel `mentor_applications`
--

CREATE TABLE `mentor_applications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `expertise` varchar(255) NOT NULL,
  `experience` int(11) DEFAULT 0,
  `instagram` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `cv_link` varchar(500) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reject_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `mentor_applications`
--

INSERT INTO `mentor_applications` (`id`, `user_id`, `name`, `phone`, `expertise`, `experience`, `instagram`, `linkedin`, `cv_link`, `reason`, `status`, `reject_reason`, `created_at`, `updated_at`) VALUES
(3, 21, 'prima', '0881026478162', 'masak', 3, '@mintul', '', 'https://drive.google.com/drive/folders/1ML5lk9fQay2tfD2d9o3HO09SHHdWn9m6?usp=drive_link', 'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', 'rejected', 'tidak sesuai', '2026-02-28 15:26:07', '2026-03-02 16:19:03'),
(4, 22, 'Silvi Fatimatuzzahroil B', '0881026478162', 'Bahasa Inggris', 2, '@Silvi_', '', 'https://drive.google.com/drive/folders/1ML5lk9fQay2tfD2d9o3HO09SHHdWn9m6?usp=drive_link', 'Saya ingin menjadi mentor di NeoScholar karena saya percaya bahwa bahasa Inggris adalah kunci membuka peluang yang lebih luas bagi generasi muda Indonesia. Sebagai lulusan pendidikan bahasa Inggris UNESA, saya ingin berbagi ilmu dan pengalaman saya kepada siswa yang ingin berkembang. Saya berkomitmen untuk mengajar dengan metode yang menyenangkan, interaktif, dan mudah dipahami sehingga siswa tidak takut lagi berbicara bahasa Inggris.', 'approved', NULL, '2026-03-02 07:52:10', '2026-03-02 07:56:37'),
(5, 21, 'prima', '0881026478162', 'Bahasa Inggris', 0, '@primap', '', 'https://drive.google.com/drive/folders/1ML5lk9fQay2tfD2d9o3HO09SHHdWn9m6?usp=drive_link', 'Saya ingin menjadi mentor di NeoScholar karena teknologi adalah bagian penting dari kehidupan modern yang harus dikuasai sejak dini. Sebagai lulusan TIK UNAIR, saya ingin membantu siswa memahami dunia digital dengan cara yang praktis dan menyenangkan. Saya berkomitmen untuk membimbing siswa agar melek teknologi, mampu berpikir logis, dan siap menghadapi era digital yang terus berkembang pesat.', 'pending', NULL, '2026-03-02 21:38:01', '2026-03-02 21:38:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `proof_image` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `total_amount`, `proof_image`, `status`, `created_at`) VALUES
(17, 21, 199998.00, '/assets/images/proofs/1772487415_struk.jpg', 'approved', '2026-03-03 04:36:55'),
(18, 21, 130000.00, '/assets/images/proofs/1772487602_struk.jpg', 'approved', '2026-03-03 04:40:02'),
(19, 21, 400000.00, '/assets/images/proofs/1772487678_struk.jpg', 'rejected', '2026-03-03 04:41:18'),
(20, 21, 174998.00, '/assets/images/proofs/1772488260_struk.jpg', 'pending', '2026-03-03 04:51:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `course_id`, `price`) VALUES
(24, 17, 2, 199998.00),
(25, 18, 15, 130000.00),
(26, 19, 1, 150000.00),
(27, 19, 12, 250000.00),
(28, 20, 14, 174998.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','mentor','client') DEFAULT 'client',
  `specialization` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `cv_link` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `specialization`, `bio`, `category`, `is_active`, `avatar`, `created_at`, `cv_link`, `phone`) VALUES
(15, 'Nadia Yulianingtias ', 'nadiayuli@gmail.com', '$2y$10$O9aLYSzC.Du9bshYPTEWy.5IxYq1my87CmcToc40oXl35sKJS9PKS', 'mentor', 'Teknologi Informasi dan Komunikasi', 'Universitas Negeri Airlangga', 'kepelatihan', 1, '/assets/images/profiles/1772431083_WhatsApp Image 2026-03-01 at 04.28.40.jpeg', '2026-02-19 13:14:17', 'https://drive.google.com/drive/folders/1ML5lk9fQay2tfD2d9o3HO09SHHdWn9m6?usp=sharing', '62881026478166'),
(17, 'Admin NeoSchoolar', 'adminNeo@gmail.com', '$2y$10$Xa2fJS4UMVSB7/LYQhKU7e8wcx8ceYKqg6FtvQtdl6WjMnc2QgZUm', 'admin', NULL, NULL, NULL, 1, NULL, '2026-02-19 16:05:19', NULL, NULL),
(21, 'prima', 'prima@gmail.com', '$2y$10$rwTf4hY8Dkr7k/gspb7s2OiLAL1WFLtiwtB3gpHw5MGJKewSBx88.', 'client', NULL, NULL, NULL, 1, NULL, '2026-02-28 15:19:50', NULL, NULL),
(22, 'Silvi Fatimatuzzahroil B', 'Silvi@gmail.com', '$2y$10$X.1GdhC7Azmysfnrhpko9O2J5BXpbqIK1T3awuQEdkkVaLbTe6qty', 'mentor', 'Bahasa Inggris', 'Universitas Negeri Surabaya', 'language', 1, '/assets/images/profiles/1772467970_WhatsApp Image 2026-03-01 at 04.28.40 (1).jpeg', '2026-03-02 07:49:31', 'https://drive.google.com/file/d/1Fm0sF93zEqTj6KKipt581nrQD_L1GE6I/view?usp=drive_link', '62881026478166'),
(23, 'nurul aini', 'nurul@gmail.com', '$2y$10$wPRTgevHpwPb0nl/Vq6pP.tqO9bANPdT5ddXB1Z8/5ZaAsVjM/dkG', 'client', NULL, NULL, NULL, 1, NULL, '2026-03-10 01:45:09', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(4, 23, 'c3dbd9d28d224c860f470d8d5ad7c4a79522a28c2901f8eca6a5999dabec3b61', '2026-03-11 10:56:44', '2026-03-10 09:56:44'),
(9, 17, 'c85b2ef2798cc68bf43738b715c045f6585f8d44283192441cfc5818837b3c13', '2026-03-11 14:47:00', '2026-03-10 13:46:14'),
(10, 22, '8a8fec20b523c51e74b00ffbe9b761c2d9ae81827c9d0b6ff4970c3cb882c52d', '2026-03-11 16:00:55', '2026-03-10 15:00:55');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_course` (`user_id`,`course_id`),
  ADD KEY `fk_cart_course` (`course_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `mentor_id` (`mentor_id`);

--
-- Indeks untuk tabel `mentor_applications`
--
ALTER TABLE `mentor_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `mentor_applications`
--
ALTER TABLE `mentor_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT untuk tabel `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_cart_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_course_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_course_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `mentor_applications`
--
ALTER TABLE `mentor_applications`
  ADD CONSTRAINT `mentor_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_items_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
