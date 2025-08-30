-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 30, 2025 at 12:05 PM
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
  `type` varchar(50) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `gramage` json DEFAULT NULL
) ;

--
-- Dumping data for table `aliments`
--

INSERT INTO `aliments` (`id`, `nom`, `type`, `path`, `gramage`) VALUES
(1, 'Orange', 'fruit', 'Orange.png', NULL),
(2, 'Carotte', 'legume', 'carotte.png', NULL),
(3, 'Épinard', 'legume', 'epinard.png', NULL),
(4, 'Saumon', 'aliment', 'saumon.png', NULL),
(5, 'Poulet', 'aliment', 'poulet.png', NULL),
(6, 'Boeuf', 'aliment', 'boeuf.png', NULL),
(8, 'lait', 'produit-laitier', 'lait.svg', NULL),
(9, 'fraise', 'fruit', 'fraise.svg', NULL),
(10, 'melon', 'fruit', 'melon.png', NULL),
(11, 'concombre', 'legume', 'concombre.svg', NULL),
(12, 'scampi', 'poisson', 'scampi.svg', NULL),
(13, 'Avoine', 'cereale', 'avoine.png', NULL),
(14, 'pain', 'produit-transforme', 'bread.svg', NULL),
(16, 'Dinde', 'viande-blanche', 'dinde.png', NULL),
(25, 'Oeuf', 'proteine-animale', 'oeuf.svg', '\"{\\\"A\\\":\\\"10g\\\"}\"'),
(27, 'q', 'poisson', 'tomato-svgrepo-com.svg', '\"{A:\\\"25g\\\"}\"'),
(28, 'Salade', 'legume', 'salade.svg', '\"{\\\"A\\\":\\\"10g\\\"}\"'),
(29, 'Frites', 'produit-transforme', 'frites.svg', '\"{\\\"B\\\":\\\"50g\\\"}\"'),
(30, 'banane', 'fruit', 'banane.svg', '\"{\\\"C\\\":\\\"50g\\\"}\"'),
(31, 'aubergine', 'legume', 'aubergine.svg', '\"{\\\"A\\\":\\\"3g\\\"}\"'),
(32, 'cocktail', 'boisson', 'cocktail2.png', '\"{\\\"A\\\":\\\"3g\\\"}\"'),
(33, 'cocktail fraise', 'boisson', 'cocktail1.png', '\"{\\\"A\\\":\\\"3g\\\"}\"'),
(34, 'cocktail 3', 'boisson', 'cocktail3.png', '\"{\\\"A\\\":\\\"3g\\\"}\"'),
(35, 'test', 'aliment', 'image_mask.png', '\"{\\\"A\\\":\\\"3g\\\"}\"');

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
(3, 1),
(3, 36),
(4, 2),
(4, 4),
(4, 36),
(6, 1),
(6, 2),
(9, 36),
(36, 1);

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
(295, 36, 'avantage', 'Améliore la vision, notamment la vision nocturne'),
(296, 36, 'avantage', 'Renforce le système immunitaire'),
(297, 36, 'avantage', 'Favorise la santé de la peau et des muqueuses'),
(298, 36, 'avantage', 'Participe à la croissance cellulaire et à la différenciation'),
(299, 36, 'avantage', 'Joue un rôle important dans la reproduction et le développement embryonnaire'),
(300, 36, 'carence', 'Cécité nocturne et risques accrus de cécité totale  Affaiblissement du système immunitaire, augmentation des infections  Sécheresse de la peau et des muqueuses  Retard de croissance chez l’enfant  Problèmes de fertilité'),
(301, 36, 'excès', 'Toxicité (hypervitaminose A) pouvant causer maux de tête, nausées, fatigue  Douleurs osseuses, perte d’appétit  Anomalies congénitales en cas de surconsommation pendant la grossesse  Peau sèche, desquamation'),
(303, 37, 'avantage', 'sss');

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
(10, 'test ', '4321'),
(11, 'Coenzyme NAD', 'Précurseur du NAD+ et NADP+, cofacteurs essentiels dans les réactions d\'oxydoréduction'),
(12, 'Métabolisme énergétique', 'Participe à la glycolyse, au cycle de Krebs et à la chaîne respiratoire'),
(13, 'Synthèse d\'hormones', 'Impliquée dans la synthèse d\'hormones stéroïdiennes et d\'hormones thyroïdiennes'),
(14, 'Réparation ADN', 'Contribue aux mécanismes de réparation de l\'ADN via les enzymes PARP'),
(15, 'sss', 'sss'),
(16, 's', 's'),
(21, 'ss', 'ss'),
(22, 'ssssss', 'sss'),
(23, 'sssss', 'sssss'),
(24, 'ssss', 'sssssss'),
(25, 'sssssss', 's'),
(26, 'ssssssssssss', 's'),
(27, 'ssssssssss', 's'),
(28, 'ssssssssssssssssssssssssssssssssss', 'sss'),
(29, 'bryam', 'testq'),
(30, 'd', 'd'),
(31, ' Système immunitaire', ' Elle maintient l’intégrité des barrières épithéliales et favorise la production de globules blancs.'),
(32, 'Visions', 'Maintien de la santé oculaire.');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nom`, `email`, `password`, `created_at`, `role`) VALUES
(1, 'Bryam', 'bryamrishing@gmail.com', '$2a$12$9pju1fejLIg87oFTv.85lOKqsV4GRudx6LpZT9sOggPfEUaVVLuvW', '2025-06-28 12:33:11', 'admin'),
(3, 'Airton', 'airtoncesar098@gmail.com', '$2a$12$J3ymkr5TfLc6jaw/p.YYP.M/e0pJL2LmCeYrPcWQM.rWhkJlHFita', '2025-08-02 12:52:33', 'admin'),
(4, 'bryam', 'test@gmail.com', '$2b$10$5apfSTMveWrpSjn//wytJ.fsyneyqiApCItSPWE13JKHJqcRWgImC', '2025-08-03 13:45:26', NULL),
(5, 'test1', 'test1@gmail.com', '$2b$10$L5P/Jt77IVY/Mcw1PU8J7O9PQdBoO3jH78cxWbBvEzdtuKSOmaq5C', '2025-08-03 13:49:30', NULL),
(6, 'test3', 'test3@gmail.com', '$2b$10$9sijrZHcrmzZR85jH5pyV.Vg7e0AZy9bCWejm.UeHOGc7hb2r2VVK', '2025-08-03 13:55:58', NULL),
(7, 'tieri', 'tieri@gmail.com', '$2b$10$cdeLEsAEpFeteGGFv.s.aenjiYry0srPB5QSAFD8PM0Q1Rw9698iu', '2025-08-03 19:54:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vitamines`
--

CREATE TABLE `vitamines` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `couleur` char(8) DEFAULT NULL,
  `nom_scientifique` varchar(255) DEFAULT NULL,
  `gramage` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vitamines`
--

INSERT INTO `vitamines` (`id`, `nom`, `description`, `couleur`, `nom_scientifique`, `gramage`) VALUES
(36, 'Vitamine A', 'La vitamine A est une vitamine liposoluble essentielle pour la vision, le système immunitaire, la reproduction et la santé de la\n', '#5ab575', 'Rétinol', 1033),
(37, 'test', 'cc', '#5c7cc1', 'cc', 0);

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
(36, 31),
(36, 32);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=304;

--
-- AUTO_INCREMENT for table `fonctions`
--
ALTER TABLE `fonctions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vitamines`
--
ALTER TABLE `vitamines`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `effets`
--
ALTER TABLE `effets`
  ADD CONSTRAINT `effets_ibfk_1` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
