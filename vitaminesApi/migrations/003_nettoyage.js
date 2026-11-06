// Migration 003 — retire les données de test restées dans la base.
//
//   npm run migrate:nettoyage                       montre ce qui serait supprimé (rien n'est modifié)
//   npm run migrate:nettoyage -- --apply            supprime ces lignes (une transaction)
//   npm run migrate:nettoyage -- --apply --drop-legacy
//                                                   supprime aussi les anciennes tables legacy_*
//
// Supprimé :
//   - nutriments « vitamine-a-legacy » et « test-vitamine » (doublon et essai :
//     la liste affichait 15 vitamines au lieu de 13) ; leurs apports, effets et
//     liens aliments partent par ON DELETE CASCADE ;
//   - aliments d'essai « q » et « test » ;
//   - fonctions reliées à aucun nutriment.
// docker-entrypoint/init.sql est déjà nettoyé : rien à faire sur une base neuve.

const NUTRIMENTS_TEST = ["vitamine-a-legacy", "test-vitamine"];
const ALIMENTS_TEST = ["q", "test"];
const LEGACY_TABLES = ["legacy_aliments_vitamines", "legacy_vitamine_fonction", "legacy_effets", "legacy_vitamines"];

const ORPHAN_FONCTIONS = `FROM fonctions f
    WHERE NOT EXISTS (SELECT 1 FROM nutriment_fonction nf WHERE nf.fonction_id = f.id)`;

async function preview(conn) {
    const [nutriments] = await conn.query("SELECT id, slug, nom FROM nutriments WHERE slug IN (?)", [NUTRIMENTS_TEST]);
    const [aliments] = await conn.query("SELECT id, nom FROM aliments WHERE BINARY nom IN (?)", [ALIMENTS_TEST]);
    const [fonctions] = await conn.query(`SELECT f.id, f.nom ${ORPHAN_FONCTIONS}`);
    const [legacy] = await conn.query(
        "SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (?)",
        [LEGACY_TABLES]
    );
    return { nutriments, aliments, fonctions, legacy: legacy.map((r) => r.t || r.TABLE_NAME) };
}

async function migrate(conn, { apply = false, dropLegacy = false } = {}, log = console.log) {
    const found = await preview(conn);
    const list = (rows) => (rows.length ? rows.map((r) => `${r.id} ${r.slug || r.nom}`).join(", ") : "aucun");
    log(`  nutriments de test : ${list(found.nutriments)}`);
    log(`  aliments de test : ${list(found.aliments)}`);
    log(`  fonctions orphelines : ${list(found.fonctions)}`);
    log(`  tables legacy_* : ${found.legacy.join(", ") || "aucune"}${dropLegacy ? "" : " (gardées sans --drop-legacy)"}`);
    if (!apply) {
        log("  Aperçu seulement : relancer avec --apply pour supprimer.");
        return found;
    }

    await conn.beginTransaction();
    try {
        await conn.query("DELETE FROM nutriments WHERE slug IN (?)", [NUTRIMENTS_TEST]);
        await conn.query("DELETE FROM aliments WHERE BINARY nom IN (?)", [ALIMENTS_TEST]);
        await conn.query(`DELETE f ${ORPHAN_FONCTIONS}`);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    }
    // DROP TABLE valide la transaction tout seul : fait après le COMMIT
    if (dropLegacy) {
        for (const t of found.legacy) await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
    }
    log("  Nettoyage appliqué.");
    return found;
}

module.exports = { migrate, preview };

if (require.main === module) {
    require("dotenv").config();
    const db = require("../db");
    const apply = process.argv.includes("--apply");
    const dropLegacy = process.argv.includes("--drop-legacy");
    (async () => {
        const conn = await db.getConnection();
        try {
            await migrate(conn, { apply, dropLegacy });
            console.log("Migration 003 (nettoyage) terminée.");
        } finally {
            conn.release();
            await db.end();
        }
    })().catch((err) => {
        console.error("Migration 003 échouée :", err.message);
        process.exit(1);
    });
}
