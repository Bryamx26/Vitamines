const db = require("../db");

const Vitamines = {
    async getAll() {
        const [rows] = await db.query(`SELECT * FROM vitamines`);
        return rows;
    },

    async getVitamine(id) {
        const [rows] = await db.query(`SELECT * FROM vitamines WHERE id = ?`, [id]);
        return rows;
    },

    async getEffects(id) {
        const [rows] = await db.query(
            `SELECT id, type AS type_effet, description FROM effets WHERE vitamine_id = ?`,
            [id]
        );
        return rows;
    },

    async getFonctions(id) {
        const [rows] = await db.query(
            `SELECT f.id, f.nom, f.description 
       FROM fonctions f 
       JOIN vitamine_fonction vf ON f.id = vf.fonction_id 
       WHERE vf.vitamine_id = ?`,
            [id]
        );
        return rows;
    },

    async updateVitamine(id, { nom, description, couleur, nom_scientifique, gramage, effets, fonctions }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1️⃣ Mise à jour des infos générales
            await connection.query(
                'UPDATE vitamines SET nom = ?, description = ?, couleur = ?, nom_scientifique = ?, gramage = ? WHERE id = ?',
                [nom, description, couleur, nom_scientifique, gramage, id]
            );

            // 2️⃣ Supprimer les anciens effets et liens fonctions
            await connection.query('DELETE FROM effets WHERE vitamine_id = ?', [id]);
            await connection.query('DELETE FROM vitamine_fonction WHERE vitamine_id = ?', [id]);

            // 3️⃣ Insertion des nouveaux effets (si existants)
            if (Array.isArray(effets) && effets.length > 0) {
                // Déduplication des effets
                const uniqueEffets = Array.from(
                    new Map(effets.map(e => [`${e.type}-${e.description}`, e])).values()
                );

                const placeholders = uniqueEffets.map(() => '(?, ?, ?)').join(', ');
                const values = uniqueEffets.flatMap(e => [id, e.type, e.description]);

                await connection.query(
                    `INSERT INTO effets (vitamine_id, type, description) VALUES ${placeholders}`,
                    values
                );
            }

            // 4️⃣ Gestion des fonctions
            if (Array.isArray(fonctions) && fonctions.length > 0) {
                const funcIds = [];
                for (const f of fonctions) {
                    const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
                    let fid;
                    if (rows.length === 0) {
                        const [result] = await connection.query(
                            'INSERT INTO fonctions (nom, description) VALUES (?, ?)',
                            [f.nom, f.description]
                        );
                        fid = result.insertId;
                    } else {
                        fid = rows[0].id;
                        await connection.query('UPDATE fonctions SET description = ? WHERE id = ?', [f.description, fid]);
                    }
                    funcIds.push(fid);
                }

                // Déduplication des IDs de fonctions
                const uniqueFuncIds = [...new Set(funcIds)];

                // Préparer placeholders et valeurs pour MySQL2
                const linkPlaceholders = uniqueFuncIds.map(() => '(?, ?)').join(', ');
                const linkValues = uniqueFuncIds.flatMap(fid => [id, fid]);

                if (linkValues.length > 0) {
                    await connection.query(
                        `INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ${linkPlaceholders}`,
                        linkValues
                    );
                }
            }

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async createVitamine({ nom, description, couleur, nom_scientifique, gramage, effets, fonctions }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                'INSERT INTO vitamines (nom, description, couleur, nom_scientifique, gramage) VALUES (?, ?, ?, ?, ?)',
                [nom, description, couleur, nom_scientifique, gramage]
            );

            const vitamineId = result.insertId;

            // Effets
            if (Array.isArray(effets) && effets.length > 0) {
                const uniqueEffets = Array.from(
                    new Map(effets.map(e => [`${e.type}-${e.description}`, e])).values()
                );
                const placeholders = uniqueEffets.map(() => '(?, ?, ?)').join(', ');
                const values = uniqueEffets.flatMap(e => [vitamineId, e.type, e.description]);

                await connection.query(
                    `INSERT INTO effets (vitamine_id, type, description) VALUES ${placeholders}`,
                    values
                );
            }

            // Fonctions
            if (Array.isArray(fonctions) && fonctions.length > 0) {
                const funcIds = [];
                for (const f of fonctions) {
                    const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
                    let fid;
                    if (rows.length === 0) {
                        const [r] = await connection.query(
                            'INSERT INTO fonctions (nom, description) VALUES (?, ?)',
                            [f.nom, f.description]
                        );
                        fid = r.insertId;
                    } else {
                        fid = rows[0].id;
                    }
                    funcIds.push(fid);
                }

                const uniqueFuncIds = [...new Set(funcIds)];
                const linkPlaceholders = uniqueFuncIds.map(() => '(?, ?)').join(', ');
                const linkValues = uniqueFuncIds.flatMap(fid => [vitamineId, fid]);

                if (linkValues.length > 0) {
                    await connection.query(
                        `INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ${linkPlaceholders}`,
                        linkValues
                    );
                }
            }

            await connection.commit();
            return { id: vitamineId, success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async deleteVitamine(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query('DELETE FROM effets WHERE vitamine_id = ?', [id]);
            await connection.query('DELETE FROM vitamine_fonction WHERE vitamine_id = ?', [id]);
            await connection.query('DELETE FROM vitamines WHERE id = ?', [id]);
            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = Vitamines;
