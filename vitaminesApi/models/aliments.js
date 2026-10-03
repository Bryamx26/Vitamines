const db = require('../db');

const Aliments = {

    async getAll() {

        const [rows] = await db.query('SELECT * FROM aliments');
        return rows;
    },

    // Compatibilité : [{ id, nom, aliment (= path), vitamine }] pour un nom de vitamine.
    // Les aliments sans image (path NULL, créés par le seed) sont exclus : l'ancien front
    // ne sait afficher que des images.
    async getAlimentsByVitamineName(nom) {
        const [rows] = await db.query(`
SELECT a.id, a.nom, a.path AS aliment, n.nom AS vitamine
FROM nutriments n
JOIN aliment_nutriment an
ON n.id = an.nutriment_id
JOIN aliments a
ON a.id = an.aliment_id
WHERE n.nom = ? AND a.path IS NOT NULL
ORDER BY a.id`, [nom]);
        return rows;
    },


    async createAliment(aliment) {

        const [rows] = await db.query("INSERT INTO `aliments` (nom, type, path,gramage) VALUES (?,?,?,?)",[aliment.nom , aliment.type, aliment.path,aliment.json]);
        return rows;
    },


    // Associer un aliment à une vitamine (nutriment)
    async associate(alimentId, vitamineId) {
        const [rows] = await db.query(
            "INSERT IGNORE INTO `aliment_nutriment` (aliment_id, nutriment_id) VALUES (?, ?)",
            [alimentId, vitamineId]
        );
        return rows;
    },

    // Désassocier un aliment d'une vitamine (nutriment)
    async dissociate(alimentId, vitamineId) {
        const [rows] = await db.query(
            "DELETE FROM `aliment_nutriment` WHERE aliment_id = ? AND nutriment_id = ?",
            [alimentId, vitamineId]
        );
        return rows;
    }



}

module.exports = Aliments;
