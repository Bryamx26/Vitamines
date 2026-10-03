const Vitamines = require("../models/vitamines");
const { clearAllCache } = require("../middlewares/cache-middleware");
const { ENUMS } = require("../models/nutriments");

// Accents du design system acceptés pour la couleur d'une vitamine
const TONES = ENUMS.tone;

async function getVitamines(req, res) {

    try {

        const vitamines = await Vitamines.getAll();
        res.status(200).json(vitamines);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}

async function getVitamine(req, res) {
    const id = parseInt(req.params.id);
    try {
        const vitamine = await Vitamines.getVitamine(id);
        if (!vitamine || vitamine.length === 0) {
            return res.status(404).send({ error: "Vitamine non trouvée" });
        }
        res.status(200).json(vitamine);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }

}
async function getVitamineEffects(req, res) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({ error: "ID invalide" });
    }

    try {
        const effects = await Vitamines.getEffects(id);

        if (!effects || effects.length === 0) {
            return res.status(404).send({ error: "Aucun effet trouvé pour cette vitamine" });
        }

        res.status(200).json(effects);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

async function getVitamineFonctions(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).send({ error: "ID invalide" });

    }
    try {
        const fonctions = await Vitamines.getFonctions(id);
        res.status(200).json(fonctions);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
}


async function getVitamineComplete(req, res) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({ error: "ID invalide" });
    }

    try {
        const vitamine = await Vitamines.getVitamine(id);

        if (!vitamine || vitamine.length === 0) {
            return res.status(404).send({ error: "Vitamine non trouvée" });
        }

        const effets = await Vitamines.getEffects(id);
        const fonctions = await Vitamines.getFonctions(id);

        res.status(200).json({
            ...vitamine[0],
            effets,
            fonctions
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

async function createVitamine(req, res) {
    try {
        const { nom, description, couleur, nom_scientifique, effets, fonctions , gramage, tone} = req.body;

        if (!nom || !description) {
            return res.status(400).json({ message: 'Nom et description sont requis' });
        }
        if (tone != null && !TONES.includes(tone)) {
            return res.status(400).json({ message: `Couleur invalide (${TONES.join(', ')})` });
        }

        const vitamineData = {
            nom,
            description,
            couleur,
            nom_scientifique,
            gramage,
            effets,
            fonctions,
            tone

        };



        const result = await Vitamines.createVitamine(vitamineData);

        clearAllCache();
        res.status(201).json({ message: 'Vitamine créée', id: result.id });
    } catch (error) {
        console.error('Erreur lors de la création de la vitamine:', error);
        res.status(500).json({ message: 'Erreur lors de la création' });
    }
}

async function updateVitamine(req, res) {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send({ error: "ID invalide" });
        }

        const { nom, description, couleur, nom_scientifique,gramage, effets, fonctions, tone } = req.body;

        if (!nom || !description) {
            return res.status(400).json({ message: 'Nom et description sont requis' });
        }
        if (tone != null && !TONES.includes(tone)) {
            return res.status(400).json({ message: `Couleur invalide (${TONES.join(', ')})` });
        }

        const vitamineData = {
            nom,
            description,
            couleur,
            nom_scientifique,
            gramage,
            effets,
            fonctions,
            tone
        };

        await Vitamines.updateVitamine(id, vitamineData);

        clearAllCache();

        // Renvoyer les données mises à jour directement
        const updatedVitamine = await Vitamines.getVitamine(id);
        res.json(updatedVitamine[0]);

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la vitamine:', error);
        res.status(500).json({ message: 'Erreur mise à jour' });
    }
}

async function deleteVitamine(req, res) {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send({ error: "ID invalide" });
        }

        await Vitamines.deleteVitamine(id);

        clearAllCache();

        res.json({ message: 'Vitamine supprimée' });

    } catch (error) {
        console.error('Erreur lors de la suppression de la vitamine:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
}





module.exports = { getVitamines, getVitamine, getVitamineEffects, getVitamineFonctions, getVitamineComplete, createVitamine, updateVitamine, deleteVitamine, };