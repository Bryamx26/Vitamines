// Migration 001 — tables « nutriments » + reprise des anciennes tables vitamines.
//
//   npm run migrate                 applique la migration (idempotente)
//   npm run migrate -- --print-sql  affiche le schéma (source de docker-entrypoint/02_nutriments.sql)
//
// Étapes : schéma (CREATE TABLE IF NOT EXISTS) → catégories → copie de l'existant
// (mêmes id) → renommage des anciennes tables en legacy_*.

const { slugify } = require("../utils/text");

const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS nutriments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS nutriment_formes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL, nom VARCHAR(150) NOT NULL, description TEXT, ordre INT DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS nutriment_fonction (
  nutriment_id INT NOT NULL, fonction_id INT NOT NULL, ordre INT DEFAULT 0,
  PRIMARY KEY (nutriment_id, fonction_id),
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE,
  FOREIGN KEY (fonction_id) REFERENCES fonctions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS nutriment_effets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  type ENUM('avantage','carence','exces','interaction') NOT NULL,
  description TEXT NOT NULL, ordre INT DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS allegations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL, texte TEXT NOT NULL, source VARCHAR(100) DEFAULT 'EFSA',
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS apports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  population ENUM('adulte','homme','femme','grossesse','allaitement','enfant') NOT NULL,
  type ENUM('recommande','adequat','max','min','supplement') NOT NULL,
  valeur_min DECIMAL(10,3) NOT NULL, valeur_max DECIMAL(10,3) NULL,
  unite VARCHAR(30) NOT NULL, source VARCHAR(120), note TEXT,
  a_verifier BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS aliment_nutriment (
  aliment_id BIGINT UNSIGNED NOT NULL, nutriment_id INT NOT NULL, teneur VARCHAR(60) NULL,
  PRIMARY KEY (aliment_id, nutriment_id),
  FOREIGN KEY (aliment_id) REFERENCES aliments(id) ON DELETE CASCADE,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  cible_nutriment_id INT NULL,
  cible_libre VARCHAR(120) NULL,
  type ENUM('favorise','diminue','synergie','depend','competition','aggrave','medicament') NOT NULL,
  description TEXT,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE,
  FOREIGN KEY (cible_nutriment_id) REFERENCES nutriments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

const CATEGORIES = [
    ["vitamine", "Vitamines"],
    ["mineral", "Minéraux"],
    ["oligo-element", "Oligo-éléments"],
];

const CATEGORIES_SQL = `INSERT INTO categories (code, nom) VALUES
${CATEGORIES.map(([code, nom]) => `  ('${code}', '${nom}')`).join(",\n")}
ON DUPLICATE KEY UPDATE nom = VALUES(nom)`;

// Anciennes tables → nom legacy (renommées une fois copiées : l'API ne les lit plus)
const LEGACY_TABLES = [
    ["vitamines", "legacy_vitamines"],
    ["vitamine_fonction", "legacy_vitamine_fonction"],
    ["effets", "legacy_effets"],
    ["aliments_vitamines", "legacy_aliments_vitamines"],
];

function printSql() {
    const header = `-- Généré par : cd vitaminesApi && npm run migrate -- --print-sql
-- Schéma des nutriments, exécuté par MySQL après 01_vitamines_db.sql au premier démarrage.
-- La reprise des anciennes données (copie + renommage legacy_*) se fait avec « npm run migrate ».
`;
    console.log(header + [...SCHEMA, CATEGORIES_SQL].map((s) => s + ";").join("\n\n"));
}

async function tableExists(conn, name) {
    const [rows] = await conn.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        [name]
    );
    return rows.length > 0;
}

// "Vitamine B12" → "B12"
function symboleFromNom(nom) {
    const m = /^vitamine\s+([A-Z]\d*)\b/i.exec(nom || "");
    return m ? m[1].toUpperCase() : null;
}

async function copyLegacy(conn, log) {
    const [[cat]] = await conn.query("SELECT id FROM categories WHERE code = 'vitamine'");

    // 1. vitamines → nutriments (même id)
    const [vitamines] = await conn.query("SELECT * FROM vitamines ORDER BY id");
    let copied = 0;
    for (const v of vitamines) {
        const [exists] = await conn.query("SELECT id FROM nutriments WHERE id = ?", [v.id]);
        if (exists.length) continue;

        let slug = slugify(v.nom) || `nutriment-${v.id}`;
        const [taken] = await conn.query("SELECT id FROM nutriments WHERE slug = ?", [slug]);
        if (taken.length) slug = `${slug}-${v.id}`;

        await conn.query(
            `INSERT INTO nutriments (id, slug, nom, symbole, nom_scientifique, categorie_id, couleur, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [v.id, slug, v.nom, symboleFromNom(v.nom), v.nom_scientifique, cat.id,
                v.couleur ? String(v.couleur).trim().slice(0, 7) : null, v.description]
        );

        // L'ancien « gramage » devient l'apport principal (les compatibilités le relisent)
        if (v.gramage !== null && v.gramage !== undefined) {
            await conn.query(
                `INSERT INTO apports (nutriment_id, population, type, valeur_min, unite, source, note)
                 VALUES (?, 'adulte', 'recommande', ?, 'mg/j', 'ancienne base', 'Repris de vitamines.gramage')`,
                [v.id, v.gramage]
            );
        }
        copied++;
    }
    log(`  vitamines → nutriments : ${copied} copiée(s) sur ${vitamines.length}`);

    // 2. vitamine_fonction → nutriment_fonction
    const [vf] = await conn.query(
        `INSERT IGNORE INTO nutriment_fonction (nutriment_id, fonction_id, ordre)
         SELECT vf.vitamine_id, vf.fonction_id, 0
         FROM vitamine_fonction vf
         JOIN nutriments n ON n.id = vf.vitamine_id
         JOIN fonctions f ON f.id = vf.fonction_id`
    );
    log(`  vitamine_fonction → nutriment_fonction : ${vf.affectedRows} lien(s)`);

    // 3. effets → nutriment_effets (seulement pour les nutriments qui n'en ont pas encore)
    const [ef] = await conn.query(
        `INSERT INTO nutriment_effets (nutriment_id, type, description, ordre)
         SELECT e.vitamine_id,
                CASE WHEN e.type = 'excès' THEN 'exces' ELSE e.type END,
                e.description,
                ROW_NUMBER() OVER (PARTITION BY e.vitamine_id ORDER BY e.id) - 1
         FROM effets e
         JOIN nutriments n ON n.id = e.vitamine_id
         WHERE NOT EXISTS (SELECT 1 FROM nutriment_effets ne WHERE ne.nutriment_id = e.vitamine_id)`
    );
    log(`  effets → nutriment_effets : ${ef.affectedRows} effet(s)`);

    // 4. aliments_vitamines → aliment_nutriment (les liens orphelins sont signalés, pas copiés)
    const [al] = await conn.query(
        `INSERT IGNORE INTO aliment_nutriment (aliment_id, nutriment_id)
         SELECT av.aliment_id, av.vitamine_id
         FROM aliments_vitamines av
         JOIN aliments a ON a.id = av.aliment_id
         JOIN nutriments n ON n.id = av.vitamine_id`
    );
    const [orphans] = await conn.query(
        `SELECT av.aliment_id, av.vitamine_id
         FROM aliments_vitamines av
         LEFT JOIN aliments a ON a.id = av.aliment_id
         LEFT JOIN nutriments n ON n.id = av.vitamine_id
         WHERE a.id IS NULL OR n.id IS NULL`
    );
    log(`  aliments_vitamines → aliment_nutriment : ${al.affectedRows} lien(s)`);
    if (orphans.length) {
        log(`  ⚠ ${orphans.length} lien(s) orphelin(s) non copiés (restent dans legacy_aliments_vitamines) : `
            + orphans.map((o) => `aliment ${o.aliment_id} → vitamine ${o.vitamine_id}`).join(", "));
    }
}

async function migrate(conn, log = console.log) {
    for (const sql of SCHEMA) await conn.query(sql);
    await conn.query(CATEGORIES_SQL);
    log("Schéma nutriments : OK");

    const hasLegacySource = await tableExists(conn, "vitamines");
    if (hasLegacySource) {
        await conn.beginTransaction();
        try {
            await copyLegacy(conn, log);
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        }
    } else {
        log("Anciennes tables déjà migrées (legacy_*) : rien à copier");
    }

    // L'AUTO_INCREMENT repart au-dessus du plus grand id existant
    const [[{ maxId }]] = await conn.query("SELECT COALESCE(MAX(id), 0) AS maxId FROM nutriments");
    await conn.query(`ALTER TABLE nutriments AUTO_INCREMENT = ${Number(maxId) + 1}`);

    // Renommage legacy_* (l'API ne lit plus ces tables)
    const renames = [];
    for (const [from, to] of LEGACY_TABLES) {
        if ((await tableExists(conn, from)) && !(await tableExists(conn, to))) renames.push(`\`${from}\` TO \`${to}\``);
    }
    if (renames.length) {
        await conn.query(`RENAME TABLE ${renames.join(", ")}`);
        log(`Tables renommées : ${renames.join(", ").replace(/`/g, "")}`);
    }
}

module.exports = { SCHEMA, CATEGORIES_SQL, migrate };

if (require.main === module) {
    if (process.argv.includes("--print-sql")) {
        printSql();
    } else {
        const db = require("../db");
        (async () => {
            const conn = await db.getConnection();
            try {
                await migrate(conn);
                console.log("Migration 001 terminée.");
            } finally {
                conn.release();
                await db.end();
            }
        })().catch((err) => {
            console.error("Migration échouée :", err.message);
            process.exit(1);
        });
    }
}
