-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 07, 2025 at 06:47 PM
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
-- Database: `vitamines_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `aliments`
--

CREATE TABLE `aliments` (
  `id` bigint UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL
) ;

--
-- Dumping data for table `aliments`
--

INSERT INTO `aliments` (`id`, `nom`, `type`) VALUES
(1, 'Orange', 'fruit'),
(2, 'Carotte', 'legume'),
(3, 'Épinard', 'legume'),
(4, 'Saumon', 'poisson'),
(5, 'Poulet', 'volaille'),
(6, 'Boeuf', 'viande');

-- --------------------------------------------------------

--
-- Table structure for table `aliments_vitamines`
--

CREATE TABLE `aliments_vitamines` (
  `aliment_id` int NOT NULL,
  `vitamine_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `aliments_vitamines`
--

INSERT INTO `aliments_vitamines` (`aliment_id`, `vitamine_id`) VALUES
(1, 3),
(2, 1),
(3, 1),
(3, 3),
(4, 2),
(4, 4),
(5, 2),
(6, 1),
(6, 2);

-- --------------------------------------------------------

--
-- Table structure for table `effets`
--

CREATE TABLE `effets` (
  `id` int NOT NULL,
  `vitamine_id` int NOT NULL,
  `type` enum('avantage','excès','carence') NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `effets`
--

INSERT INTO `effets` (`id`, `vitamine_id`, `type`, `description`) VALUES
(61, 1, 'avantage', 'bryamtesthehe'),
(62, 1, 'avantage', 'test2'),
(63, 1, 'excès', 'test 1234'),
(64, 4, 'avantage', 'Renforce les os et les dents, améliore l\'immunité.'),
(65, 4, 'excès', 'Hypercalcémie, nausées, lésions rénales.'),
(66, 4, 'carence', 'Rachitisme chez les enfants, ostéomalacie chez l\'adulte.'),
(67, 2, 'avantage', 'Prévient l\'anémie et maintient une fonction nerveuse normale.'),
(68, 2, 'avantage', 'Faibles risques, généralement bien tolérée.'),
(69, 2, 'carence', 'Fatigue, anémie, troubles neurologiques.');

-- --------------------------------------------------------

--
-- Table structure for table `fonctions`
--

CREATE TABLE `fonctions` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `fonctions`
--

INSERT INTO `fonctions` (`id`, `nom`, `description`) VALUES
(1, 'Vision', 'Maintien de la santé oculaire.'),
(2, 'Immunité', 'Renforcement des défenses immunitaires.'),
(3, 'Formation des globules rouges', 'Production normale des cellules sanguines.'),
(4, 'Santé osseuse', 'Minéralisation des os, absorption du calcium.'),
(5, 'Fonction neurologique', 'Transmission nerveuse et métabolisme du cerveau.'),
(6, 'Aide au maintien de la masse oeseuse', 'kdqdkqsjdlqs'),
(7, 'aide a la cuagulation', 'klsqjcqljljclqc'),
(8, 'Active les protéines', 'nécessaires à la coagulation sanguine (facteurs II, VII, IX, X).'),
(9, 'Prévention', 'Aide à prévenir la calcification des artères.'),
(10, 'test ', '4321');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nom`, `email`, `password`, `created_at`) VALUES
(1, 'Bryam', 'bryamrishing@gmail.com', '$2a$12$9pju1fejLIg87oFTv.85lOKqsV4GRudx6LpZT9sOggPfEUaVVLuvW', '2025-06-28 12:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `vitamines`
--

CREATE TABLE `vitamines` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `couleur` char(8) DEFAULT NULL,
  `nom_scientifique` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vitamines`
--

INSERT INTO `vitamines` (`id`, `nom`, `description`, `couleur`, `nom_scientifique`) VALUES
(1, 'Vitamine A', 'Essentielle pour la vision, le système immunitaire et la reproduction.', '#65ae81', 'heheh'),
(2, 'Vitamine B12', 'Importante pour les cellules sanguines et les fonctions neurologiques.', '#4485bb', 'Cobala'),
(4, 'Vitamine D', 'Joue un rôle clé dans la santé osseuse et le métabolisme du calcium.', '#b86f6f', 'Calciférol');

-- --------------------------------------------------------

--
-- Table structure for table `vitamine_fonction`
--

CREATE TABLE `vitamine_fonction` (
  `vitamine_id` int NOT NULL,
  `fonction_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vitamine_fonction`
--

INSERT INTO `vitamine_fonction` (`vitamine_id`, `fonction_id`) VALUES
(1, 1),
(1, 2),
(2, 3),
(4, 4),
(2, 5),
(1, 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aliments`
--
ALTER TABLE `aliments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `aliments_vitamines`
--
ALTER TABLE `aliments_vitamines`
  ADD PRIMARY KEY (`aliment_id`,`vitamine_id`);

--
-- Indexes for table `effets`
--
ALTER TABLE `effets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vitamine_id` (`vitamine_id`);

--
-- Indexes for table `fonctions`
--
ALTER TABLE `fonctions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vitamines`
--
ALTER TABLE `vitamines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vitamine_fonction`
--
ALTER TABLE `vitamine_fonction`
  ADD PRIMARY KEY (`vitamine_id`,`fonction_id`),
  ADD KEY `fk_fonction` (`fonction_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aliments`
--
ALTER TABLE `aliments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `effets`
--
ALTER TABLE `effets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `fonctions`
--
ALTER TABLE `fonctions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vitamines`
--
ALTER TABLE `vitamines`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `effets`
--
ALTER TABLE `effets`
  ADD CONSTRAINT `effets_ibfk_1` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vitamine_fonction`
--
ALTER TABLE `vitamine_fonction`
  ADD CONSTRAINT `fk_fonction` FOREIGN KEY (`fonction_id`) REFERENCES `fonctions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vitamine` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vitamine_fonction_ibfk_1` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vitamine_fonction_ibfk_2` FOREIGN KEY (`fonction_id`) REFERENCES `fonctions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
