const db = require('../db');

const Aliments = {

    async getAll() {

        const [rows] = await db.query('SELECT * FROM aliments');
        return rows;
    },
    async getAlimentsByVitamineName(nom) {
        const [rows] = await db.query(`
SELECT a.id, a.nom, a.path AS aliment, v.nom AS vitamine 
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
    },

   
    // Associer un aliment à une vitamine
    async associate(alimentId, vitamineId) {
        const [rows] = await db.query(
            "INSERT IGNORE INTO `aliments_vitamines` (aliment_id, vitamine_id) VALUES (?, ?)",
            [alimentId, vitamineId]
        );
        return rows;
    },

    // Désassocier un aliment d'une vitamine
    async dissociate(alimentId, vitamineId) {
        const [rows] = await db.query(
            "DELETE FROM `aliments_vitamines` WHERE aliment_id = ? AND vitamine_id = ?",
            [alimentId, vitamineId]
        );
        return rows;
    }



}

module.exports = Aliments;