const db = require('../db');

const Aliments = {

    async getAll() {

        const [rows] = await db.query('SELECT * FROM aliments');
        return rows;
    },
    async getAlimentsByVitamineName(nom) {
        const [rows] = await db.query(`
SELECT a.nom, a.path AS aliment, v.nom AS vitamine 
FROM vitamines v 
JOIN aliments_vitamines av 
ON v.id = av.vitamine_id 
JOIN aliments a 
ON a.id = av.aliment_id 
WHERE v.nom = ?`, [nom]);
        return rows;
    },


    async createAliment(aliment) {

        const [rows] = await db.query("INSERT INTO `aliments` (nom, type, path,gramage) VALUES (?,?,?,?)",[aliment.nom , aliment.type, aliment.path,aliment.json]);
        return rows;
    }

}

module.exports = Aliments;