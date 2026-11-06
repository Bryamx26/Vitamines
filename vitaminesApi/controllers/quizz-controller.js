const Quizz = require('../models/quizz');

const MAX_LIMIT = 50;

function toId(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

const texte = (v) => (typeof v === 'string' ? v.trim() : '');

// Vérifie et normalise le corps de POST / PUT. Renvoie { data } ou { error }.
function validate(body = {}) {
    const question = texte(body.question);
    const correction = texte(body.correction);
    if (!question) return { error: 'La question est obligatoire' };
    if (!correction) return { error: 'La correction est obligatoire' };

    const ids = Array.isArray(body.nutriment_ids) ? body.nutriment_ids.map(toId) : [];
    if (!ids.length || ids.includes(null)) return { error: 'Choisissez au moins une vitamine' };
    const nutriment_ids = [...new Set(ids)];

    if (!Array.isArray(body.reponses)) return { error: 'Les réponses sont obligatoires' };
    const reponses = [];
    for (const r of body.reponses) {
        const t = texte(r && r.texte);
        if (!t) continue; // ligne vide ignorée
        if (t.length > 255) return { error: 'Une réponse dépasse 255 caractères' };
        if (!Quizz.STATUTS.includes(r.statut)) return { error: `Statut invalide pour « ${t} »` };
        reponses.push({ texte: t, statut: r.statut, explication: texte(r.explication) || null });
    }
    if (reponses.length < 2) return { error: 'Il faut au moins 2 réponses' };
    if (!reponses.some((r) => r.statut === 'correcte')) return { error: 'Il faut au moins une réponse correcte' };

    return { data: { question, correction, nutriment_ids, reponses } };
}

async function getQuizz(req, res) {
    try {
        const nutrimentIds = String(req.query.nutriments || '')
            .split(',').map(toId).filter(Boolean);
        const limit = toId(req.query.limit);
        const questions = await Quizz.list({
            nutrimentIds,
            limit: limit ? Math.min(limit, MAX_LIMIT) : null,
            random: req.query.random === '1' || req.query.random === 'true',
        });
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function getQuizzVitamines(req, res) {
    try {
        res.json(await Quizz.nutrimentsAvecQuestions());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function getQuestion(req, res) {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' });
    try {
        const q = await Quizz.getById(id);
        if (!q) return res.status(404).json({ error: 'Question introuvable' });
        res.json(q);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function checkNutriments(data, res) {
    const manquants = await Quizz.nutrimentsManquants(data.nutriment_ids);
    if (manquants.length) {
        res.status(400).json({ error: `Vitamine introuvable : ${manquants.join(', ')}` });
        return false;
    }
    return true;
}

async function createQuestion(req, res) {
    const { data, error } = validate(req.body);
    if (error) return res.status(400).json({ error });
    try {
        if (!(await checkNutriments(data, res))) return;
        const id = await Quizz.create(data, req.user && req.user.id);
        res.status(201).json(await Quizz.getById(id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function updateQuestion(req, res) {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' });
    const { data, error } = validate(req.body);
    if (error) return res.status(400).json({ error });
    try {
        if (!(await checkNutriments(data, res))) return;
        const ok = await Quizz.update(id, data);
        if (!ok) return res.status(404).json({ error: 'Question introuvable' });
        res.json(await Quizz.getById(id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function deleteQuestion(req, res) {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' });
    try {
        const ok = await Quizz.remove(id);
        if (!ok) return res.status(404).json({ error: 'Question introuvable' });
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

module.exports = {
    validate, getQuizz, getQuizzVitamines, getQuestion, createQuestion, updateQuestion, deleteQuestion,
};
