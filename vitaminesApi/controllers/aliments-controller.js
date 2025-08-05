const Aliments = require('../models/aliments');



async function getAllAliments(req, res) {
    try {
        const aliments = await Aliments.getAll();
        res.json(aliments);
    }
    catch (error) {

        console.error(error);
    }
}

async function getAliments(req, res) {
    const nom = req.params.nom;
    try {
        const aliments = await Aliments.getAlimentsByVitamineName(nom);
        if (!aliments || aliments.length === 0) {
            return res.status(404).json({ error: 'No aliments found' });
        }
        res.json(aliments);

    }
    catch (error) {
        console.error(error);
    }
}

module.exports = { getAllAliments, getAliments };