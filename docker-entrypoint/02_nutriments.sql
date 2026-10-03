-- Généré par : cd vitaminesApi && npm run migrate -- --print-sql
-- Schéma des nutriments, exécuté par MySQL après 01_vitamines_db.sql au premier démarrage.
-- La reprise des anciennes données (copie + renommage legacy_*) se fait avec « npm run migrate ».
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  symbole VARCHAR(10),
  nom_scientifique VARCHAR(255),
  categorie_id INT NOT NULL,
  famille ENUM('liposoluble','hydrosoluble') NULL,
  tone ENUM('leaf','peach','butter','lilac','sky','rose') NULL,
  couleur CHAR(7) NULL,
  description TEXT,
  absorption TEXT, metabolisme TEXT, stockage TEXT, elimination TEXT,
  quantite_corps VARCHAR(255), unites TEXT, apports_note TEXT, aliments_source TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nutriment_categorie FOREIGN KEY (categorie_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriment_formes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL, nom VARCHAR(150) NOT NULL, description TEXT, ordre INT DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriment_fonction (
  nutriment_id INT NOT NULL, fonction_id INT NOT NULL, ordre INT DEFAULT 0,
  PRIMARY KEY (nutriment_id, fonction_id),
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE,
  FOREIGN KEY (fonction_id) REFERENCES fonctions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriment_effets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  type ENUM('avantage','carence','exces','interaction') NOT NULL,
  description TEXT NOT NULL, ordre INT DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS allegations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL, texte TEXT NOT NULL, source VARCHAR(100) DEFAULT 'EFSA',
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS apports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  population ENUM('adulte','homme','femme','grossesse','allaitement','enfant') NOT NULL,
  type ENUM('recommande','adequat','max','min','supplement') NOT NULL,
  valeur_min DECIMAL(10,3) NOT NULL, valeur_max DECIMAL(10,3) NULL,
  unite VARCHAR(30) NOT NULL, source VARCHAR(120), note TEXT,
  a_verifier BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aliment_nutriment (
  aliment_id BIGINT UNSIGNED NOT NULL, nutriment_id INT NOT NULL, teneur VARCHAR(60) NULL,
  PRIMARY KEY (aliment_id, nutriment_id),
  FOREIGN KEY (aliment_id) REFERENCES aliments(id) ON DELETE CASCADE,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  cible_nutriment_id INT NULL,
  cible_libre VARCHAR(120) NULL,
  type ENUM('favorise','diminue','synergie','depend','competition','aggrave','medicament') NOT NULL,
  description TEXT,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE,
  FOREIGN KEY (cible_nutriment_id) REFERENCES nutriments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (code, nom) VALUES
  ('vitamine', 'Vitamines'),
  ('mineral', 'Minéraux'),
  ('oligo-element', 'Oligo-éléments')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);
