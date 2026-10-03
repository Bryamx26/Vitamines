const Aliments = require('../models/aliments');
const { clearAllCache } = require("../middlewares/cache-middleware");
const fs = require("fs").promises;
const path = require("path");
const { ALLOWED } = require("../middlewares/uploadMiddleware");
const { normalize, slugify } = require("../utils/text");


async function getAllAliments(req, res) {
    try {
        const aliments = await Aliments.getAll();
        res.json(aliments);
    }
    catch (error) {

        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
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
        res.status(500).json({ error: "Erreur serveur" });
    }
}


// Dossier des images d'aliments (partagé avec le front ; voir docker-compose.yml)
const IMAGES_DIR = process.env.ALIMENTS_IMAGES_DIR
    || path.join(__dirname, "../../vitamines/public/images/alimentsImages");

// Un SVG peut contenir du script : on refuse tout contenu actif
const SVG_DANGEREUX = /<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/i;

async function postNewAliment (req, res) {
    const { nom, type, json } = req.body;

    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });
    if (!nom || !type) return res.status(400).json({ error: "Nom et type requis" });

    const ext = ALLOWED[req.file.mimetype];
    if (ext === ".svg" && SVG_DANGEREUX.test(req.file.buffer.toString("utf8"))) {
        return res.status(400).json({ error: "SVG refusé : il contient du script ou des gestionnaires d'événements." });
    }

    try {
        const allAliments = await Aliments.getAll();
        const exist = allAliments.some(a => normalize(a.nom) === normalize(nom));

        if (exist) {
            return res.status(400).json({ error: "Aliment déjà existant" });
        }

        // Nom de fichier généré côté serveur (jamais le nom envoyé par le client)
        const base = slugify(nom) || "aliment";
        let fileName = `${base}${ext}`;
        for (let i = 2; ; i++) {
            try {
                await fs.writeFile(path.join(IMAGES_DIR, fileName), req.file.buffer, { flag: "wx" });
                break;
            } catch (err) {
                if (err.code !== "EEXIST") throw err;
                fileName = `${base}-${i}${ext}`;
            }
        }

        // Créer l'aliment dans la DB
        const aliment = await Aliments.createAliment({ nom, type, path: fileName, json });

        clearAllCache();
        res.status(201).json({
            message: "Aliment créé avec succès",
            aliment,
            svg: fileName,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

async function linkAlimentToVitamine(req, res) {
    const { alimentId, vitamineId } = req.body;

    if (!alimentId || !vitamineId) {
        return res.status(400).json({ error: "IDs manquants" });
    }

    try {
        await Aliments.associate(alimentId, vitamineId);
        clearAllCache();
        res.status(200).json({ message: "Association réussie" });
    } catch (error) {
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({ error: "Aliment ou vitamine introuvable" });
        }
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'association" });
    }
}

async function unlinkAlimentFromVitamine(req, res) {
    const { alimentId, vitamineId } = req.body;

    if (!alimentId || !vitamineId) {
        return res.status(400).json({ error: "IDs manquants" });
    }

    try {
        const result = await Aliments.dissociate(alimentId, vitamineId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Liaison non trouvée" });
        }
        clearAllCache();
        res.status(200).json({ message: "Désassociation réussie" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la désassociation" });
    }
}

module.exports = { getAllAliments, getAliments , postNewAliment , linkAlimentToVitamine, unlinkAlimentFromVitamine };