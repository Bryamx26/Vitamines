const db = require("../db");
const { slugify } = require("../utils/text");

// Couleur claire du design system pour chaque tone (compatibilité ancien front)
const TONE_COLORS = {
    leaf: "#c5dcb2",
    peach: "#f8cdb3",
    butter: "#f6e5a6",
    lilac: "#d9cff2",
    sky: "#c2dfec",
    rose: "#f4c3cf",
};

const ENUMS = {
    famille: ["liposoluble", "hydrosoluble"],
    tone: Object.keys(TONE_COLORS),
    effet: ["avantage", "carence", "exces", "interaction"],
    population: ["adulte", "homme", "femme", "grossesse", "allaitement", "enfant"],
    apport: ["recommande", "adequat", "max", "min", "supplement"],
    interaction: ["favorise", "diminue", "synergie", "depend", "competition", "aggrave", "medicament"],
};

// Colonnes de `nutriments` modifiables via l'API (hors id et categorie_id)
const FIELDS = [
    "slug", "nom", "symbole", "nom_scientifique", "famille", "tone", "couleur", "description",
    "absorption", "metabolisme", "stockage", "elimination", "quantite_corps", "unites",
    "apports_note", "aliments_source",
];

// Apport « principal » : population adulte > homme > femme…, apport recommandé > adéquat…
const POPULATION_ORDER = ["adulte", "homme", "femme", "grossesse", "allaitement", "enfant"];
const TYPE_ORDER = ["recommande", "adequat", "supplement", "min"];

function pickPrincipal(apports) {
    const candidates = apports.filter((a) => TYPE_ORDER.includes(a.type));
    candidates.sort((a, b) =>
        POPULATION_ORDER.indexOf(a.population) - POPULATION_ORDER.indexOf(b.population)
        || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
        || a.id - b.id
    );
    return candidates[0] || null;
}

function normalizeEffetType(type) {
    return type === "excès" ? "exces" : type;
}

// Accepte un tableau [{type, description}] ou un objet groupé {avantage: [...], ...}
function flattenEffets(effets) {
    if (Array.isArray(effets)) return effets;
    if (effets && typeof effets === "object") {
        return Object.entries(effets).flatMap(([type, list]) =>
            (list || []).map((e) => (typeof e === "string" ? { type, description: e } : { ...e, type }))
        );
    }
    return [];
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

// id numérique ou slug → id (ou null)
async function resolveId(idOuSlug, conn = db) {
    const value = String(idOuSlug);
    const [rows] = /^\d+$/.test(value)
        ? await conn.query("SELECT id FROM nutriments WHERE id = ?", [Number(value)])
        : await conn.query("SELECT id FROM nutriments WHERE slug = ?", [value]);
    return rows.length ? rows[0].id : null;
}

async function listCategories() {
    const [rows] = await db.query(
        `SELECT c.id, c.code, c.nom, c.description, COUNT(n.id) AS nb_nutriments
         FROM categories c
         LEFT JOIN nutriments n ON n.categorie_id = c.id
         GROUP BY c.id
         ORDER BY c.id`
    );
    return rows;
}

// Apport principal pour une liste d'id (une seule requête)
async function principalApports(ids, conn = db) {
    if (!ids.length) return new Map();
    const [rows] = await conn.query(
        `SELECT id, nutriment_id, population, type, valeur_min, valeur_max, unite
         FROM apports WHERE nutriment_id IN (?)`,
        [ids]
    );
    const byNutriment = new Map();
    for (const row of rows) {
        if (!byNutriment.has(row.nutriment_id)) byNutriment.set(row.nutriment_id, []);
        byNutriment.get(row.nutriment_id).push(row);
    }
    const result = new Map();
    for (const [id, list] of byNutriment) {
        const p = pickPrincipal(list);
        if (p) {
            const { population, type, valeur_min, valeur_max, unite } = p;
            result.set(id, { population, type, valeur_min, valeur_max, unite });
        }
    }
    return result;
}

async function list({ categorie, famille, q } = {}) {
    const where = [];
    const params = [];
    if (categorie) { where.push("c.code = ?"); params.push(categorie); }
    if (famille) { where.push("n.famille = ?"); params.push(famille); }
    if (q) {
        // Début de mot (« fer » ne doit pas trouver « Calciférol »), symbole exact
        const term = String(q).trim().replace(/[\\%_]/g, "\\$&");
        where.push(`(n.nom LIKE ? OR n.nom LIKE ? OR n.slug LIKE ? OR n.nom_scientifique LIKE ?
                     OR n.nom_scientifique LIKE ? OR n.symbole = ?)`);
        params.push(`${term}%`, `% ${term}%`, `${term}%`, `${term}%`, `% ${term}%`, term);
    }
    const [rows] = await db.query(
        `SELECT n.id, n.slug, n.nom, n.symbole, n.nom_scientifique, c.code AS categorie,
                n.famille, n.tone, n.couleur
         FROM nutriments n
         JOIN categories c ON c.id = n.categorie_id
         ${where.length ? "WHERE " + where.join(" AND ") : ""}
         ORDER BY c.id, n.id`,
        params
    );
    const principal = await principalApports(rows.map((r) => r.id));
    return rows.map((r) => ({ ...r, apport_principal: principal.get(r.id) || null }));
}

async function getBase(id) {
    const [rows] = await db.query(
        `SELECT n.*, c.code AS categorie, c.nom AS categorie_nom
         FROM nutriments n
         JOIN categories c ON c.id = n.categorie_id
         WHERE n.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getFormes(id) {
    const [rows] = await db.query(
        "SELECT id, nom, description, ordre FROM nutriment_formes WHERE nutriment_id = ? ORDER BY ordre, id",
        [id]
    );
    return rows;
}

async function getFonctions(id) {
    const [rows] = await db.query(
        `SELECT f.id, f.nom, f.description, nf.ordre
         FROM nutriment_fonction nf
         JOIN fonctions f ON f.id = nf.fonction_id
         WHERE nf.nutriment_id = ?
         ORDER BY nf.ordre, f.id`,
        [id]
    );
    return rows;
}

async function getEffets(id) {
    const [rows] = await db.query(
        "SELECT id, type, description, ordre FROM nutriment_effets WHERE nutriment_id = ? ORDER BY ordre, id",
        [id]
    );
    return rows;
}

function groupEffets(rows) {
    const grouped = Object.fromEntries(ENUMS.effet.map((t) => [t, []]));
    for (const e of rows) grouped[e.type].push({ id: e.id, description: e.description });
    return grouped;
}

async function getAllegations(id) {
    const [rows] = await db.query(
        "SELECT id, texte, source FROM allegations WHERE nutriment_id = ? ORDER BY id",
        [id]
    );
    return rows;
}

async function getApports(id) {
    const [rows] = await db.query(
        `SELECT id, population, type, valeur_min, valeur_max, unite, source, note, a_verifier
         FROM apports WHERE nutriment_id = ? ORDER BY id`,
        [id]
    );
    return rows.map((r) => ({ ...r, a_verifier: Boolean(r.a_verifier) }));
}

async function getAliments(id) {
    const [rows] = await db.query(
        `SELECT a.id, a.nom, a.type, a.path, an.teneur
         FROM aliment_nutriment an
         JOIN aliments a ON a.id = an.aliment_id
         WHERE an.nutriment_id = ?
         ORDER BY a.nom`,
        [id]
    );
    return rows;
}

async function getInteractions(id) {
    const [rows] = await db.query(
        `SELECT i.id, i.type, i.description, i.cible_libre,
                c.id AS cible_id, c.slug AS cible_slug, c.nom AS cible_nom
         FROM interactions i
         LEFT JOIN nutriments c ON c.id = i.cible_nutriment_id
         WHERE i.nutriment_id = ?
         ORDER BY i.id`,
        [id]
    );
    return rows.map(({ cible_id, cible_slug, cible_nom, cible_libre, ...rest }) => ({
        ...rest,
        cible: cible_id ? { id: cible_id, slug: cible_slug, nom: cible_nom } : null,
        cible_libre,
    }));
}

async function getFull(id) {
    const base = await getBase(id);
    if (!base) return null;
    const [formes, fonctions, effets, allegations, apports, aliments, interactions] = await Promise.all([
        getFormes(id), getFonctions(id), getEffets(id), getAllegations(id),
        getApports(id), getAliments(id), getInteractions(id),
    ]);
    return {
        ...base,
        apport_principal: pickPrincipal(apports),
        formes,
        fonctions,
        effets: groupEffets(effets),
        allegations,
        apports,
        aliments,
        interactions,
    };
}

async function getNutrimentsOfAliment(alimentId) {
    const [rows] = await db.query(
        `SELECT n.id, n.slug, n.nom, n.symbole, c.code AS categorie, n.famille, n.tone, n.couleur, an.teneur
         FROM aliment_nutriment an
         JOIN nutriments n ON n.id = an.nutriment_id
         JOIN categories c ON c.id = n.categorie_id
         WHERE an.aliment_id = ?
         ORDER BY c.id, n.id`,
        [alimentId]
    );
    return rows;
}

async function alimentExists(alimentId) {
    const [rows] = await db.query("SELECT id FROM aliments WHERE id = ?", [alimentId]);
    return rows.length > 0;
}

/* ------------------------------------------------------------------ */
/* Écriture (toutes les fonctions reçoivent une connexion en transaction) */
/* ------------------------------------------------------------------ */

async function categorieId(conn, code) {
    const [rows] = await conn.query("SELECT id FROM categories WHERE code = ?", [code]);
    return rows.length ? rows[0].id : null;
}

// Fonction partagée : retrouvée par nom (la description fournie gagne), sinon créée
async function upsertFonction(conn, { nom, description }) {
    const cleanNom = String(nom).trim();
    const [rows] = await conn.query("SELECT id FROM fonctions WHERE TRIM(nom) = ? ORDER BY id LIMIT 1", [cleanNom]);
    if (rows.length) {
        if (description !== undefined) {
            await conn.query("UPDATE fonctions SET description = ? WHERE id = ?", [description, rows[0].id]);
        }
        return rows[0].id;
    }
    const [result] = await conn.query("INSERT INTO fonctions (nom, description) VALUES (?, ?)", [cleanNom, description ?? null]);
    return result.insertId;
}

async function replaceFormes(conn, id, formes = []) {
    await conn.query("DELETE FROM nutriment_formes WHERE nutriment_id = ?", [id]);
    for (const [i, f] of formes.entries()) {
        await conn.query(
            "INSERT INTO nutriment_formes (nutriment_id, nom, description, ordre) VALUES (?, ?, ?, ?)",
            [id, f.nom, f.description ?? null, i]
        );
    }
}

async function replaceFonctions(conn, id, fonctions = []) {
    await conn.query("DELETE FROM nutriment_fonction WHERE nutriment_id = ?", [id]);
    const seen = new Set();
    for (const [i, f] of fonctions.entries()) {
        const fid = await upsertFonction(conn, f);
        if (seen.has(fid)) continue;
        seen.add(fid);
        await conn.query(
            "INSERT INTO nutriment_fonction (nutriment_id, fonction_id, ordre) VALUES (?, ?, ?)",
            [id, fid, i]
        );
    }
}

async function replaceEffets(conn, id, effets) {
    await conn.query("DELETE FROM nutriment_effets WHERE nutriment_id = ?", [id]);
    for (const [i, e] of flattenEffets(effets).entries()) {
        await conn.query(
            "INSERT INTO nutriment_effets (nutriment_id, type, description, ordre) VALUES (?, ?, ?, ?)",
            [id, normalizeEffetType(e.type), e.description, i]
        );
    }
}

async function replaceAllegations(conn, id, allegations = []) {
    await conn.query("DELETE FROM allegations WHERE nutriment_id = ?", [id]);
    for (const a of allegations) {
        const texte = typeof a === "string" ? a : a.texte;
        const source = typeof a === "string" ? "EFSA" : (a.source || "EFSA");
        await conn.query("INSERT INTO allegations (nutriment_id, texte, source) VALUES (?, ?, ?)", [id, texte, source]);
    }
}

async function replaceApports(conn, id, apports = []) {
    await conn.query("DELETE FROM apports WHERE nutriment_id = ?", [id]);
    for (const a of apports) {
        await conn.query(
            `INSERT INTO apports (nutriment_id, population, type, valeur_min, valeur_max, unite, source, note, a_verifier)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, a.population, a.type, a.valeur_min, a.valeur_max ?? null, a.unite,
                a.source ?? null, a.note ?? null, a.a_verifier ? 1 : 0]
        );
    }
}

// aliments : [id] ou [{ id, teneur }]
async function replaceAliments(conn, id, aliments = []) {
    await conn.query("DELETE FROM aliment_nutriment WHERE nutriment_id = ?", [id]);
    const seen = new Set();
    for (const a of aliments) {
        const alimentId = typeof a === "object" ? a.id : a;
        if (seen.has(String(alimentId))) continue;
        seen.add(String(alimentId));
        await conn.query(
            "INSERT INTO aliment_nutriment (aliment_id, nutriment_id, teneur) VALUES (?, ?, ?)",
            [alimentId, id, typeof a === "object" ? (a.teneur ?? null) : null]
        );
    }
}

// interactions : { cible: "fer" | "oxalates" | "medicament:anti-vitamine K", type, description }
// ou { cible_nutriment_id, cible_libre, type, description }
async function replaceInteractions(conn, id, interactions = []) {
    await conn.query("DELETE FROM interactions WHERE nutriment_id = ?", [id]);
    for (const it of interactions) {
        let cibleId = it.cible_nutriment_id ?? null;
        let cibleLibre = it.cible_libre ?? null;
        if (!cibleId && !cibleLibre && it.cible) {
            const cible = String(it.cible);
            if (cible.startsWith("medicament:")) {
                cibleLibre = cible.slice("medicament:".length).trim();
            } else {
                const [rows] = await conn.query("SELECT id FROM nutriments WHERE slug = ?", [cible]);
                if (rows.length) cibleId = rows[0].id;
                else cibleLibre = cible;
            }
        }
        await conn.query(
            "INSERT INTO interactions (nutriment_id, cible_nutriment_id, cible_libre, type, description) VALUES (?, ?, ?, ?, ?)",
            [id, cibleId, cibleLibre, it.type, it.description ?? null]
        );
    }
}

// Insère ou met à jour les colonnes de `nutriments` ; renvoie l'id
async function writeFields(conn, id, data) {
    const values = {};
    for (const f of FIELDS) if (data[f] !== undefined) values[f] = data[f];
    if (data.categorie !== undefined) {
        const catId = await categorieId(conn, data.categorie);
        if (!catId) throw Object.assign(new Error(`Catégorie inconnue : ${data.categorie}`), { status: 400 });
        values.categorie_id = catId;
    }
    if (values.tone && values.couleur === undefined) values.couleur = TONE_COLORS[values.tone];

    if (id) {
        if (Object.keys(values).length) {
            await conn.query("UPDATE nutriments SET ? WHERE id = ?", [values, id]);
        }
        return id;
    }
    if (!values.slug) values.slug = slugify(values.nom);
    const [result] = await conn.query("INSERT INTO nutriments SET ?", [values]);
    return result.insertId;
}

// Remplace uniquement les sous-listes présentes dans `data`
async function writeChildren(conn, id, data) {
    if (data.formes !== undefined) await replaceFormes(conn, id, data.formes);
    if (data.fonctions !== undefined) await replaceFonctions(conn, id, data.fonctions);
    if (data.effets !== undefined) await replaceEffets(conn, id, data.effets);
    if (data.allegations !== undefined) await replaceAllegations(conn, id, data.allegations);
    if (data.apports !== undefined) await replaceApports(conn, id, data.apports);
    if (data.aliments !== undefined) await replaceAliments(conn, id, data.aliments);
    if (data.interactions !== undefined) await replaceInteractions(conn, id, data.interactions);
}

async function withTransaction(fn) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

async function create(data) {
    return withTransaction(async (conn) => {
        const id = await writeFields(conn, null, data);
        await writeChildren(conn, id, data);
        return id;
    });
}

async function update(id, data) {
    return withTransaction(async (conn) => {
        await writeFields(conn, id, data);
        await writeChildren(conn, id, data);
        return id;
    });
}

async function setAliments(id, aliments) {
    return withTransaction((conn) => replaceAliments(conn, id, aliments));
}

async function remove(id) {
    const [result] = await db.query("DELETE FROM nutriments WHERE id = ?", [id]);
    return result.affectedRows > 0;
}

module.exports = {
    TONE_COLORS, ENUMS, FIELDS,
    pickPrincipal, principalApports, normalizeEffetType, flattenEffets,
    resolveId, listCategories, list, getBase, getFull,
    getFormes, getFonctions, getEffets, groupEffets, getAllegations, getApports, getAliments, getInteractions,
    getNutrimentsOfAliment, alimentExists,
    upsertFonction, replaceFormes, replaceFonctions, replaceEffets, replaceAllegations,
    replaceApports, replaceAliments, replaceInteractions, writeFields, writeChildren, withTransaction,
    create, update, setAliments, remove,
};
