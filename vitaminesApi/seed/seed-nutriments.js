// Seed des nutriments depuis data/nutriments.json — idempotent (relançable sans doublon).
//   npm run seed
//
// Tout se fait dans une transaction : catégories, nutriments (upsert par slug), sous-listes
// remplacées, aliments rapprochés sans tenir compte de la casse ni des accents, puis interactions
// (en second passage, une fois tous les nutriments présents).

const path = require("path");
const db = require("../db");
const Nutriments = require("../models/nutriments");
const { normalize } = require("../utils/text");

const DATA_FILE = path.join(__dirname, "..", "data", "nutriments.json");

// Type des aliments créés par le seed (les aliments existants gardent le leur)
const ALIMENT_TYPES = {
    fruit: ["avocat", "banane", "citron", "fraise", "fruits", "fruits secs", "kiwi", "melon", "orange"],
    legume: ["ail", "brocoli", "carotte", "champignons", "chou", "chou kale", "choucroute", "epinard", "patate douce",
        "persil", "poivron", "pomme de terre", "salade", "tomate"],
    viande: ["boeuf", "charcuterie", "foie", "porc", "poulet", "viande", "volaille"],
    poisson: ["fruits de mer", "hareng", "poisson", "sardine", "saumon"],
    "produit-laitier": ["beurre", "fromage", "lait", "yaourt"],
    cereale: ["cereales completes", "cereales enrichies", "pain", "pain complet"],
    legumineuse: ["haricots", "legumineuses", "lentilles", "natto", "pois chiches"],
    oleagineux: ["amandes", "graines de courge", "noisettes", "noix", "noix du bresil"],
    boisson: ["biere", "cafe", "eau", "eau minerale", "jus de fruit", "the", "vin"],
};

function alimentType(nom) {
    const key = normalize(nom);
    for (const [type, noms] of Object.entries(ALIMENT_TYPES)) {
        if (noms.includes(key)) return type;
    }
    return "autre";
}

const NUTRIMENT_FIELDS = Nutriments.FIELDS.filter((f) => f !== "couleur");

async function seed(conn, data, log) {
    const stats = { nutrimentsCrees: 0, nutrimentsMaj: 0, apports: 0, alimentsCrees: [], aVerifier: 0 };

    // 1. Catégories (upsert par code)
    for (const c of data.categories) {
        await conn.query(
            `INSERT INTO categories (code, nom, description) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE nom = VALUES(nom), description = COALESCE(VALUES(description), description)`,
            [c.code, c.nom, c.description ?? null]
        );
    }

    // Index des aliments existants par nom normalisé (« Œuf » = « oeuf »)
    const [aliments] = await conn.query("SELECT id, nom FROM aliments ORDER BY id");
    const alimentsParNom = new Map();
    for (const a of aliments) {
        const key = normalize(a.nom);
        if (!alimentsParNom.has(key)) alimentsParNom.set(key, a.id);
    }

    async function alimentId(nom) {
        const key = normalize(nom);
        if (alimentsParNom.has(key)) return alimentsParNom.get(key);
        const [result] = await conn.query(
            "INSERT INTO aliments (nom, type, path) VALUES (?, ?, NULL)",
            [nom, alimentType(nom)]
        );
        alimentsParNom.set(key, result.insertId);
        stats.alimentsCrees.push(nom);
        return result.insertId;
    }

    // 2. Nutriments et sous-listes (sauf interactions)
    const ids = new Map();
    for (const n of data.nutriments) {
        const [bySlug] = await conn.query("SELECT id FROM nutriments WHERE slug = ?", [n.slug]);
        let id = bySlug[0]?.id;

        // Vitamine A : reprend la ligne existante (id 36, appelée par le front)
        if (!id && n.slug === "vitamine-a") {
            const [byNom] = await conn.query(
                "SELECT id FROM nutriments WHERE nom = 'Vitamine A' ORDER BY id LIMIT 1"
            );
            id = byNom[0]?.id;
        }

        const fields = { categorie: n.categorie, couleur: Nutriments.TONE_COLORS[n.tone] ?? null };
        for (const f of NUTRIMENT_FIELDS) fields[f] = n[f] ?? null;

        if (id) {
            await Nutriments.writeFields(conn, id, fields);
            stats.nutrimentsMaj++;
        } else {
            id = await Nutriments.writeFields(conn, null, fields);
            stats.nutrimentsCrees++;
        }
        ids.set(n.slug, id);

        await Nutriments.replaceFormes(conn, id, n.formes);
        await Nutriments.replaceFonctions(conn, id, n.fonctions);
        await Nutriments.replaceEffets(conn, id, n.effets);
        await Nutriments.replaceAllegations(conn, id, n.allegations);
        await Nutriments.replaceApports(conn, id, n.apports);

        const alimentIds = [];
        for (const nom of n.aliments) alimentIds.push(await alimentId(nom));
        await Nutriments.replaceAliments(conn, id, alimentIds);

        stats.apports += n.apports.length;
        stats.aVerifier += n.apports.filter((a) => a.a_verifier).length;
    }

    // 3. Interactions (tous les nutriments existent maintenant)
    let interactions = 0;
    for (const n of data.nutriments) {
        await Nutriments.replaceInteractions(conn, ids.get(n.slug), n.interactions);
        interactions += n.interactions.length;
    }

    log(`Nutriments : ${data.nutriments.length} (${stats.nutrimentsCrees} créés, ${stats.nutrimentsMaj} mis à jour)`);
    log(`Apports : ${stats.apports} (dont ${stats.aVerifier} encore à vérifier)`);
    log(`Interactions : ${interactions}`);
    log(`Aliments créés : ${stats.alimentsCrees.length}${stats.alimentsCrees.length ? " — " + stats.alimentsCrees.join(", ") : ""}`);
    return stats;
}

module.exports = { seed, alimentType };

if (require.main === module) {
    const data = require(DATA_FILE);
    (async () => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await seed(conn, data, console.log);
            await conn.commit();
            console.log("Seed terminé.");
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
            await db.end();
        }
    })().catch((err) => {
        console.error("Seed échoué (rien n'a été écrit) :", err.message);
        process.exit(1);
    });
}
