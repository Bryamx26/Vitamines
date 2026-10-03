// Compatibilité : l'ancienne API « vitamines » lue et écrite dans les tables nutriments.
// Les réponses gardent exactement l'ancien format (id, nom, description, couleur,
// nom_scientifique, gramage) ; « gramage » = valeur_min de l'apport principal.
const db = require("../db");
const Nutriments = require("./nutriments");
const { slugify } = require("../utils/text");

const VITAMINE_SQL = `
    SELECT n.id, n.nom, n.description, n.couleur, n.nom_scientifique
    FROM nutriments n
    JOIN categories c ON c.id = n.categorie_id
    WHERE c.code = 'vitamine'`;

async function withGramage(rows) {
    const principal = await Nutriments.principalApports(rows.map((r) => r.id));
    return rows.map((r) => ({ ...r, gramage: principal.get(r.id)?.valeur_min ?? null }));
}

// Slug libre dérivé du nom (suffixe -2, -3… si déjà pris)
async function uniqueSlug(conn, nom) {
    const base = slugify(nom) || "vitamine";
    let slug = base;
    for (let i = 2; ; i++) {
        const [rows] = await conn.query("SELECT id FROM nutriments WHERE slug = ?", [slug]);
        if (!rows.length) return slug;
        slug = `${base}-${i}`;
    }
}

// Met à jour la valeur de l'apport principal, ou le crée
async function writeGramage(conn, id, gramage) {
    if (gramage === undefined || gramage === null || gramage === "") return;
    const [apports] = await conn.query("SELECT * FROM apports WHERE nutriment_id = ?", [id]);
    const principal = Nutriments.pickPrincipal(apports);
    if (principal) {
        await conn.query("UPDATE apports SET valeur_min = ? WHERE id = ?", [gramage, principal.id]);
    } else {
        await conn.query(
            `INSERT INTO apports (nutriment_id, population, type, valeur_min, unite, source)
             VALUES (?, 'adulte', 'recommande', ?, 'mg/j', 'saisie admin')`,
            [id, gramage]
        );
    }
}

const Vitamines = {
    async getAll() {
        const [rows] = await db.query(`${VITAMINE_SQL} ORDER BY n.id`);
        return withGramage(rows);
    },

    async getVitamine(id) {
        const [rows] = await db.query(`${VITAMINE_SQL} AND n.id = ?`, [id]);
        return withGramage(rows);
    },

    async getEffects(id) {
        const [rows] = await db.query(
            `SELECT id, CASE WHEN type = 'exces' THEN 'excès' ELSE type END AS type_effet, description
             FROM nutriment_effets WHERE nutriment_id = ? ORDER BY ordre, id`,
            [id]
        );
        return rows;
    },

    async getFonctions(id) {
        const [rows] = await db.query(
            `SELECT f.id, f.nom, f.description
             FROM fonctions f
             JOIN nutriment_fonction nf ON f.id = nf.fonction_id
             WHERE nf.nutriment_id = ?
             ORDER BY nf.ordre, f.id`,
            [id]
        );
        return rows;
    },

    async updateVitamine(id, { nom, description, couleur, nom_scientifique, gramage, effets, fonctions }) {
        return Nutriments.withTransaction(async (conn) => {
            await Nutriments.writeFields(conn, id, { nom, description, couleur, nom_scientifique });
            if (effets !== undefined) {
                // Déduplication des effets, comme l'ancienne version
                const unique = Array.from(
                    new Map((effets || []).map((e) => [`${e.type}-${e.description}`, e])).values()
                );
                await Nutriments.replaceEffets(conn, id, unique);
            }
            if (fonctions !== undefined) await Nutriments.replaceFonctions(conn, id, fonctions || []);
            await writeGramage(conn, id, gramage);
            return { success: true };
        });
    },

    async createVitamine({ nom, description, couleur, nom_scientifique, gramage, effets, fonctions }) {
        return Nutriments.withTransaction(async (conn) => {
            const slug = await uniqueSlug(conn, nom);
            const id = await Nutriments.writeFields(conn, null, {
                slug, nom, description, couleur, nom_scientifique, categorie: "vitamine",
            });
            const unique = Array.from(
                new Map((effets || []).map((e) => [`${e.type}-${e.description}`, e])).values()
            );
            await Nutriments.replaceEffets(conn, id, unique);
            await Nutriments.replaceFonctions(conn, id, fonctions || []);
            await writeGramage(conn, id, gramage);
            return { id, success: true };
        });
    },

    async deleteVitamine(id) {
        // Les sous-tables suivent par ON DELETE CASCADE
        await Nutriments.remove(id);
        return { success: true };
    },
};

module.exports = Vitamines;
