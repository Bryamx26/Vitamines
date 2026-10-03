const Nutriments = require("../models/nutriments");
const { clearAllCache } = require("../middlewares/cache-middleware");

const { ENUMS } = Nutriments;

function serverError(res, error) {
    console.error(error);
    return res.status(error.status || 500).json({ error: error.status ? error.message : "Erreur serveur" });
}

// Valide le corps d'un POST/PUT ; renvoie un message d'erreur ou null
function validate(body, { creation }) {
    if (!body || typeof body !== "object") return "Corps JSON attendu";
    if (creation && !body.nom) return "Le champ « nom » est requis";
    if (creation && !body.categorie) return "Le champ « categorie » est requis (vitamine, mineral ou oligo-element)";
    if (body.famille != null && !ENUMS.famille.includes(body.famille)) return `famille invalide (${ENUMS.famille.join(", ")})`;
    if (body.tone != null && !ENUMS.tone.includes(body.tone)) return `tone invalide (${ENUMS.tone.join(", ")})`;
    if (body.couleur != null && !/^#[0-9a-fA-F]{6}$/.test(body.couleur)) return "couleur invalide (format #rrggbb)";

    for (const e of Nutriments.flattenEffets(body.effets)) {
        if (!ENUMS.effet.includes(Nutriments.normalizeEffetType(e.type))) return `type d'effet invalide : ${e.type}`;
        if (!e.description) return "Chaque effet doit avoir une description";
    }
    for (const a of body.apports || []) {
        if (!ENUMS.population.includes(a.population)) return `population invalide : ${a.population}`;
        if (!ENUMS.apport.includes(a.type)) return `type d'apport invalide : ${a.type}`;
        if (typeof a.valeur_min !== "number" || !a.unite) return "Chaque apport doit avoir valeur_min (nombre) et unite";
    }
    for (const i of body.interactions || []) {
        if (!ENUMS.interaction.includes(i.type)) return `type d'interaction invalide : ${i.type}`;
    }
    for (const f of body.fonctions || []) {
        if (!f.nom) return "Chaque fonction doit avoir un nom";
    }
    for (const f of body.formes || []) {
        if (!f.nom) return "Chaque forme doit avoir un nom";
    }
    return null;
}

// Résout :idOuSlug ou répond 404
async function findId(req, res) {
    const id = await Nutriments.resolveId(req.params.idOuSlug ?? req.params.id);
    if (!id) {
        res.status(404).json({ error: "Nutriment non trouvé" });
        return null;
    }
    return id;
}

/* ---------- Lecture ---------- */

async function getCategories(req, res) {
    try {
        res.json(await Nutriments.listCategories());
    } catch (error) {
        serverError(res, error);
    }
}

async function getNutriments(req, res) {
    try {
        const { categorie, famille, q } = req.query;
        res.json(await Nutriments.list({ categorie, famille, q }));
    } catch (error) {
        serverError(res, error);
    }
}

async function getNutriment(req, res) {
    try {
        const id = await findId(req, res);
        if (!id) return;
        res.json(await Nutriments.getFull(id));
    } catch (error) {
        serverError(res, error);
    }
}

// Sous-listes : /api/nutriments/:idOuSlug/<nom>
const SUB_LISTS = {
    apports: Nutriments.getApports,
    fonctions: Nutriments.getFonctions,
    effets: async (id) => Nutriments.groupEffets(await Nutriments.getEffets(id)),
    formes: Nutriments.getFormes,
    aliments: Nutriments.getAliments,
    interactions: Nutriments.getInteractions,
    allegations: Nutriments.getAllegations,
};

function getSubList(name) {
    return async (req, res) => {
        try {
            const id = await findId(req, res);
            if (!id) return;
            res.json(await SUB_LISTS[name](id));
        } catch (error) {
            serverError(res, error);
        }
    };
}

async function getAlimentNutriments(req, res) {
    const alimentId = Number(req.params.id);
    if (!Number.isInteger(alimentId)) return res.status(400).json({ error: "ID invalide" });
    try {
        if (!(await Nutriments.alimentExists(alimentId))) {
            return res.status(404).json({ error: "Aliment non trouvé" });
        }
        res.json(await Nutriments.getNutrimentsOfAliment(alimentId));
    } catch (error) {
        serverError(res, error);
    }
}

/* ---------- Écriture (admin) ---------- */

async function createNutriment(req, res) {
    const error = validate(req.body, { creation: true });
    if (error) return res.status(400).json({ error });
    try {
        const id = await Nutriments.create(req.body);
        clearAllCache();
        res.status(201).json(await Nutriments.getFull(id));
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ce slug existe déjà" });
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Aliment inconnu" });
        serverError(res, err);
    }
}

async function updateNutriment(req, res) {
    const error = validate(req.body, { creation: false });
    if (error) return res.status(400).json({ error });
    try {
        const id = await findId(req, res);
        if (!id) return;
        await Nutriments.update(id, req.body);
        clearAllCache();
        res.json(await Nutriments.getFull(id));
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ce slug existe déjà" });
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Aliment inconnu" });
        serverError(res, err);
    }
}

async function deleteNutriment(req, res) {
    try {
        const id = await findId(req, res);
        if (!id) return;
        await Nutriments.remove(id);
        clearAllCache();
        res.json({ message: "Nutriment supprimé", id });
    } catch (error) {
        serverError(res, error);
    }
}

// Corps : [id, …] ou { aliments: [id | { id, teneur }, …] }
async function setNutrimentAliments(req, res) {
    const aliments = Array.isArray(req.body) ? req.body : req.body?.aliments;
    if (!Array.isArray(aliments)) return res.status(400).json({ error: "Liste d'aliments attendue" });
    try {
        const id = await findId(req, res);
        if (!id) return;
        await Nutriments.setAliments(id, aliments);
        clearAllCache();
        res.json(await Nutriments.getAliments(id));
    } catch (err) {
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Aliment inconnu" });
        serverError(res, err);
    }
}

module.exports = {
    getCategories, getNutriments, getNutriment, getSubList, getAlimentNutriments,
    createNutriment, updateNutriment, deleteNutriment, setNutrimentAliments,
};
