const db = require('../db');

const STATUTS = ['correcte', 'incomplete', 'fausse'];

// Ajoute à chaque question ses vitamines et ses réponses (2 requêtes pour toute la liste)
async function hydrate(questions) {
    if (!questions.length) return [];
    const ids = questions.map((q) => q.id);

    const [nutriments] = await db.query(
        `SELECT qn.quizz_id, n.id, n.slug, n.nom, n.symbole, n.tone, n.famille
         FROM quizz_nutriments qn JOIN nutriments n ON n.id = qn.nutriment_id
         WHERE qn.quizz_id IN (?) ORDER BY n.id`, [ids]);
    const [reponses] = await db.query(
        `SELECT id, quizz_id, texte, statut, explication, ordre
         FROM quizz_reponses WHERE quizz_id IN (?) ORDER BY ordre, id`, [ids]);

    return questions.map((q) => ({
        ...q,
        nutriments: nutriments.filter((n) => n.quizz_id === q.id).map(({ quizz_id, ...n }) => n),
        reponses: reponses.filter((r) => r.quizz_id === q.id).map(({ quizz_id, ...r }) => r),
    }));
}

async function writeChildren(conn, quizzId, data) {
    await conn.query(
        'INSERT INTO quizz_nutriments (quizz_id, nutriment_id) VALUES ?',
        [data.nutriment_ids.map((nid) => [quizzId, nid])]);
    await conn.query(
        'INSERT INTO quizz_reponses (quizz_id, texte, statut, explication, ordre) VALUES ?',
        [data.reponses.map((r, i) => [quizzId, r.texte, r.statut, r.explication || null, i])]);
}

async function inTransaction(fn) {
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

const Quizz = {
    STATUTS,

    // Questions liées à au moins une des vitamines demandées (toutes si la liste est vide).
    // random : ordre aléatoire ; limit : nombre maximum de questions.
    async list({ nutrimentIds = [], limit = null, random = false } = {}) {
        const params = [];
        let sql = 'SELECT q.id, q.question, q.correction, q.created_at, q.updated_at FROM quizz q';
        if (nutrimentIds.length) {
            sql += ' WHERE EXISTS (SELECT 1 FROM quizz_nutriments qn WHERE qn.quizz_id = q.id AND qn.nutriment_id IN (?))';
            params.push(nutrimentIds);
        }
        sql += random ? ' ORDER BY RAND()' : ' ORDER BY q.id DESC';
        if (limit) {
            sql += ' LIMIT ?';
            params.push(limit);
        }
        const [rows] = await db.query(sql, params);
        return hydrate(rows);
    },

    async getById(id) {
        const [rows] = await db.query(
            'SELECT id, question, correction, created_at, updated_at FROM quizz WHERE id = ?', [id]);
        const [q] = await hydrate(rows);
        return q || null;
    },

    // Nutriments qui ont au moins une question, avec leur nombre de questions
    async nutrimentsAvecQuestions() {
        const [rows] = await db.query(
            `SELECT n.id, n.slug, n.nom, n.symbole, n.tone, n.famille, c.code AS categorie,
                    COUNT(qn.quizz_id) AS nb_questions
             FROM quizz_nutriments qn
             JOIN nutriments n ON n.id = qn.nutriment_id
             JOIN categories c ON c.id = n.categorie_id
             GROUP BY n.id, c.code
             ORDER BY c.id, n.id`);
        return rows;
    },

    // Renvoie les id de nutriments qui n'existent pas
    async nutrimentsManquants(ids) {
        const [rows] = await db.query('SELECT id FROM nutriments WHERE id IN (?)', [ids]);
        const found = new Set(rows.map((r) => r.id));
        return ids.filter((id) => !found.has(id));
    },

    async create(data, userId) {
        return inTransaction(async (conn) => {
            const [res] = await conn.query(
                'INSERT INTO quizz (question, correction, created_by) VALUES (?, ?, ?)',
                [data.question, data.correction, userId || null]);
            await writeChildren(conn, res.insertId, data);
            return res.insertId;
        });
    },

    // Remplace la question, ses vitamines et ses réponses. Renvoie false si elle n'existe pas.
    async update(id, data) {
        return inTransaction(async (conn) => {
            const [res] = await conn.query(
                'UPDATE quizz SET question = ?, correction = ? WHERE id = ?',
                [data.question, data.correction, id]);
            if (res.affectedRows === 0) return false;
            await conn.query('DELETE FROM quizz_nutriments WHERE quizz_id = ?', [id]);
            await conn.query('DELETE FROM quizz_reponses WHERE quizz_id = ?', [id]);
            await writeChildren(conn, id, data);
            return true;
        });
    },

    async remove(id) {
        const [res] = await db.query('DELETE FROM quizz WHERE id = ?', [id]);
        return res.affectedRows > 0;
    },
};

module.exports = Quizz;
