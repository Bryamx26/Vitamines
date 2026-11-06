// Migration 002 — tables des quiz (questions, liens vers les vitamines, réponses).
//
//   npm run migrate:quizz                 applique la migration (idempotente)
//   npm run migrate:quizz -- --print-sql  affiche le schéma seul
//
// Le même schéma est recopié dans docker-entrypoint/init.sql pour les bases neuves.

const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS quizz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  correction TEXT NOT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_quizz_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS quizz_nutriments (
  quizz_id INT NOT NULL,
  nutriment_id INT NOT NULL,
  PRIMARY KEY (quizz_id, nutriment_id),
  CONSTRAINT fk_qn_quizz FOREIGN KEY (quizz_id) REFERENCES quizz(id) ON DELETE CASCADE,
  CONSTRAINT fk_qn_nutriment FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS quizz_reponses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quizz_id INT NOT NULL,
  texte VARCHAR(255) NOT NULL,
  statut ENUM('correcte','incomplete','fausse') NOT NULL,
  explication TEXT NULL,
  ordre INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_qr_quizz FOREIGN KEY (quizz_id) REFERENCES quizz(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

async function migrate(conn, log = console.log) {
    for (const sql of SCHEMA) await conn.query(sql);
    log("  tables quizz, quizz_nutriments, quizz_reponses : OK");
}

module.exports = { SCHEMA, migrate };

if (require.main === module) {
    if (process.argv.includes("--print-sql")) {
        console.log(SCHEMA.map((s) => s + ";").join("\n\n"));
    } else {
        require("dotenv").config();
        const db = require("../db");
        (async () => {
            const conn = await db.getConnection();
            try {
                await migrate(conn);
                console.log("Migration 002 (quiz) terminée.");
            } finally {
                conn.release();
                await db.end();
            }
        })().catch((err) => {
            console.error("Migration 002 échouée :", err.message);
            process.exit(1);
        });
    }
}
