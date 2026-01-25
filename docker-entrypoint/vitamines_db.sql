SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. CRÉATION DES TABLES
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `aliments_vitamines`;
DROP TABLE IF EXISTS `effets`;
DROP TABLE IF EXISTS `vitamine_fonction`;
DROP TABLE IF EXISTS `fonctions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `aliments`;
DROP TABLE IF EXISTS `vitamines`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `vitamines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `nom_scientifique` varchar(255) DEFAULT NULL,
  `description` text,
  `couleur` char(8) DEFAULT NULL,
  `gramage` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `aliments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `gramage` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `aliments_vitamines` (
  `aliment_id` bigint UNSIGNED NOT NULL,
  `vitamine_id` int NOT NULL,
  PRIMARY KEY (`aliment_id`,`vitamine_id`),
  CONSTRAINT `fk_aliment` FOREIGN KEY (`aliment_id`) REFERENCES `aliments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vitamine` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `fonctions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `vitamine_fonction` (
  `vitamine_id` int NOT NULL,
  `fonction_id` int NOT NULL,
  PRIMARY KEY (`vitamine_id`,`fonction_id`),
  CONSTRAINT `fk_vitamine_func` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fonction` FOREIGN KEY (`fonction_id`) REFERENCES `fonctions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `effets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vitamine_id` int NOT NULL,
  `type` enum('avantage','excès','carence') NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `effets_ibfk_1` FOREIGN KEY (`vitamine_id`) REFERENCES `vitamines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `role` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- 2. INSERTION DES VITAMINES (Fusion des deux listes)
-- --------------------------------------------------------

INSERT INTO `vitamines` (`id`, `nom`, `nom_scientifique`, `description`, `couleur`, `gramage`) VALUES
(1, 'Vitamine A', 'Rétinol', 'Essentielle pour la vision et le système immunitaire.', '#FF9800', 900),
(2, 'Vitamine B1', 'Thiamine', 'Métabolisme énergétique et système nerveux.', '#E91E63', 1200),
(3, 'Vitamine B2', 'Riboflavine', 'Santé de la peau et production d\'énergie.', '#FF5722', 1300),
(4, 'Vitamine B3', 'Niacine', 'Réparation de l\'ADN et métabolisme.', '#795548', 16000),
(5, 'Vitamine B5', 'Acide pantothénique', 'Synthèse des hormones et neurotransmetteurs.', '#9C27B0', 5000),
(6, 'Vitamine B6', 'Pyridoxine', 'Soutient le fonctionnement cérébral.', '#673AB7', 1300),
(7, 'Vitamine B8', 'Biotine', 'Santé des cheveux, ongles et peau.', '#3F51B5', 30),
(8, 'Vitamine B9', 'Acide folique', 'Formation de l\'ADN et division cellulaire.', '#00BCD4', 400),
(9, 'Vitamine B12', 'Cobalamine', 'Formation des globules rouges et influx nerveux.', '#F44336', 2.4),
(10, 'Vitamine C', 'Acide ascorbique', 'Antioxydant, aide à la formation du collagène.', '#FFEB3B', 90000),
(11, 'Vitamine D', 'Calciférol', 'Fixation du calcium sur les os.', '#03A9F4', 15),
(12, 'Vitamine E', 'Tocophérol', 'Protège les cellules contre le stress oxydatif.', '#8BC34A', 15),
(13, 'Vitamine K', 'Phylloquinone', 'Indispensable pour la coagulation sanguine.', '#4CAF50', 120),
(36, 'Vitamine A (Legacy)', 'Rétinol', 'La vitamine A est une vitamine liposoluble essentielle pour la vision...', '#5ab575', 1033),
(37, 'Test Vitamine', 'cc', 'cc', '#5c7cc1', 0);

-- --------------------------------------------------------
-- 3. INSERTION DES ALIMENTS (Fusion complète)
-- --------------------------------------------------------

INSERT INTO `aliments` (`id`, `nom`, `type`, `path`, `gramage`) VALUES
(1, 'Orange', 'fruit', 'Orange.png', '{"vitamine_principale": "C"}'),
(2, 'Carotte', 'legume', 'carotte.png', '{"vitamine_principale": "A"}'),
(3, 'Épinard', 'legume', 'epinard.png', '{"vitamine_principale": "K"}'),
(4, 'Saumon', 'poisson', 'saumon.png', '{"vitamine_principale": "D"}'),
(5, 'Poulet', 'viande', 'poulet.png', '{"vitamine_principale": "B3"}'),
(6, 'Boeuf', 'aliment', 'boeuf.png', NULL),
(8, 'Lait', 'produit-laitier', 'lait.svg', '{"vitamine_principale": "D"}'),
(9, 'fraise', 'fruit', 'fraise.svg', NULL),
(10, 'melon', 'fruit', 'melon.png', NULL),
(11, 'concombre', 'legume', 'concombre.svg', NULL),
(12, 'scampi', 'poisson', 'scampi.svg', NULL),
(13, 'Avoine', 'cereale', 'avoine.png', NULL),
(14, 'pain', 'produit-transforme', 'bread.svg', NULL),
(16, 'Dinde', 'viande-blanche', 'dinde.png', NULL),
(25, 'Oeuf', 'proteine-animale', 'oeuf.svg', '{"vitamine_principale": "B12"}'),
(27, 'q', 'poisson', 'tomato-svgrepo-com.svg', '{"A": "25g"}'),
(28, 'Salade', 'legume', 'salade.svg', '{"A": "10g"}'),
(29, 'Frites', 'produit-transforme', 'frites.svg', '{"B": "50g"}'),
(30, 'Banane', 'fruit', 'banane.svg', '{"vitamine_principale": "B6"}'),
(31, 'aubergine', 'legume', 'aubergine.svg', '{"A": "3g"}'),
(32, 'cocktail', 'boisson', 'cocktail2.png', '{"A": "3g"}'),
(33, 'cocktail fraise', 'boisson', 'cocktail1.png', '{"A": "3g"}'),
(34, 'cocktail 3', 'boisson', 'cocktail3.png', '{"A": "3g"}'),
(35, 'test', 'aliment', 'image_mask.png', '{"A": "3g"}');

-- --------------------------------------------------------
-- 4. LIAISONS ALIMENTS <-> VITAMINES
-- --------------------------------------------------------

INSERT INTO `aliments_vitamines` (`aliment_id`, `vitamine_id`) VALUES
(1, 10), (1, 8),
(2, 1), (2, 13),
(3, 1), (3, 13), (3, 8), (3, 36),
(4, 11), (4, 9), (4, 4), (4, 2), (4, 36),
(6, 1), (6, 2),
(9, 36),
(25, 9), (25, 11), (25, 1);

-- --------------------------------------------------------
-- 5. FONCTIONS ET EFFETS
-- --------------------------------------------------------

INSERT INTO `fonctions` (`id`, `nom`, `description`) VALUES
(1, 'Vision', 'Maintien de la santé oculaire.'),
(2, 'Immunité', 'Renforcement des défenses immunitaires.'),
(3, 'Formation des globules rouges', 'Production normale des cellules sanguines.'),
(31, 'Système immunitaire', 'Elle maintient l’intégrité des barrières épithéliales.'),
(32, 'Visions', 'Maintien de la santé oculaire.');

INSERT INTO `effets` (`vitamine_id`, `type`, `description`) VALUES
(1, 'avantage', 'Améliore la vision nocturne.'),
(10, 'avantage', 'Réduit la fatigue et booste l\'immunité.'),
(11, 'avantage', 'Renforce la structure osseuse.'),
(1, 'carence', 'Peut causer une sécheresse oculaire sévère.'),
(36, 'avantage', 'Améliore la vision, notamment la vision nocturne'),
(36, 'carence', 'Cécité nocturne et risques accrus de cécité totale'),
(36, 'excès', 'Toxicité (hypervitaminose A)');

-- --------------------------------------------------------
-- 6. USERS
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `nom`, `email`, `password`, `created_at`, `role`) VALUES
(1, 'Bryam', 'bryamrishing@gmail.com', '$2a$12$9pju1fejLIg87oFTv.85lOKqsV4GRudx6LpZT9sOggPfEUaVVLuvW', '2025-06-28 12:33:11', 'admin'),
(3, 'Airton', 'airtoncesar098@gmail.com', '$2a$12$J3ymkr5TfLc6jaw/p.YYP.M/e0pJL2LmCeYrPcWQM.rWhkJlHFita', '2025-08-02 12:52:33', 'admin');

COMMIT;