const db = require("../db");


const Vitamines = {
    async getAll() {
        const [rows] = await db.query(`SELECT * FROM vitamines`);
        return rows;
    },

    async getVitamine(id){
        const [rows] = await db.query(`SELECT * FROM vitamines WHERE id= ?` , [id]);
        return rows;
    },

    async getEffects(id){
        const [rows] = await db.query(
            `SELECT id, type AS type_effet, description FROM effets WHERE vitamine_id = ?`,
            [id]);
        return rows;

    },
    async getFonctions(id){
        const [rows] = await db.query( `SELECT f.id, f.nom, f.description FROM fonctions f JOIN vitamine_fonction vf ON f.id = vf.fonction_id WHERE vf.vitamine_id = ?`,
            [id]);
        return rows;
    },
    // Nouvelle méthode pour mettre à jour une vitamine
    async updateVitamine(id, { nom, description, couleur, nom_scientifique, effets, fonctions }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();


            await connection.query(
                'UPDATE vitamines SET nom = ?, description = ?, couleur = ?, nom_scientifique = ? WHERE id = ?',
                [nom, description, couleur, nom_scientifique, id]
            );


            await connection.query('DELETE FROM effets WHERE vitamine_id = ?', [id]);
            await connection.query('DELETE FROM vitamine_fonction WHERE vitamine_id = ?', [id]);

            if (Array.isArray(effets) && effets.length > 0) {
                const effData = effets.map(e => [id, e.type, e.description]);
                await connection.query('INSERT INTO effets (vitamine_id, type, description) VALUES ?', [effData]);
            }

            if (Array.isArray(fonctions) && fonctions.length > 0) {
                const funcIds = [];
                for (const f of fonctions) {
                    const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
                    let fid;
                    if (rows.length === 0) {
                        const [result] = await connection.query('INSERT INTO fonctions (nom, description) VALUES (?, ?)', [f.nom, f.description]);
                        fid = result.insertId;
                    } else {
                        fid = rows[0].id;
                    }
                    funcIds.push(fid);
                }
                const link = funcIds.map(fid => [id, fid]);
                await connection.query('INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ?', [link]);
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


    async createVitamine(vitamineData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { nom, description, couleur, nom_scientifique, effets, fonctions } = vitamineData;


            const [result] = await connection.query(
                'INSERT INTO vitamines (nom, description, couleur, nom_scientifique) VALUES (?, ?, ?, ?)',
                [nom, description, couleur, nom_scientifique]
            );

            const vitamineId = result.insertId;


            if (Array.isArray(effets) && effets.length > 0) {
                const effData = effets.map(e => [vitamineId, e.type, e.description]);
                await connection.query('INSERT INTO effets (vitamine_id, type, description) VALUES ?', [effData]);
            }


            if (Array.isArray(fonctions) && fonctions.length > 0) {
                const funcIds = [];
                for (const f of fonctions) {
                    const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
                    let fid;
                    if (rows.length === 0) {
                        const [r] = await connection.query('INSERT INTO fonctions (nom, description) VALUES (?, ?)', [f.nom, f.description]);
                        fid = r.insertId;
                    } else {
                        fid = rows[0].id;
                    }
                    funcIds.push(fid);
                }
                const link = funcIds.map(fid => [vitamineId, fid]);
                await connection.query('INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ?', [link]);
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
}

module.exports = Vitamines;