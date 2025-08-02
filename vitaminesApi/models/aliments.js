const db = require('../db');

const  Aliments = {

    async getAll() {

        const [rows] = await db.query('SELECT * FROM aliments');
        return rows;
    },
    async getAliments(nom){
        const [rows] = await db.query(`
SELECT a.nom AS aliment, v.nom AS vitamine 
FROM vitamines v 
JOIN aliments_vitamines av 
ON v.id = av.vitamine_id 
JOIN aliments a 
ON a.id = av.aliment_id 
WHERE v.nom = ?`, [nom]);
        return rows;
    }

}

module.exports = Aliments;