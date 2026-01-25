const Aliments = require('../models/aliments');
const fs = require("fs").promises;
const path = require("path");


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


const FINAL_DIR = "../vitamines/public/images/alimentsImages";


async function postNewAliment (req, res) {
    const { nom, type, json } = req.body;

    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    try {
        const allAliments = await Aliments.getAll();
        const exist = allAliments.some(a => a.path === req.file.originalname );

        if (exist) {
            return res.status(400).json({ error: "Aliment déjà existant" });
        }

        // Déplacer le SVG dans le dossier final
        const oldPath = req.file.path;
        console.log(oldPath);

        const newPath = path.join(FINAL_DIR, req.file.originalname);
        await fs.rename(oldPath, newPath);



        // Créer l'aliment dans la DB
        const aliment = await Aliments.createAliment({ nom, type, path: req.file.originalname ,json });

        res.status(201).json({
            message: "Aliment créé avec succès",
            aliment,
            svg: req.file.originalname,
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
        res.status(200).json({ message: "Association réussie" });
    } catch (error) {
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
        res.status(200).json({ message: "Désassociation réussie" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la désassociation" });
    }
}

module.exports = { getAllAliments, getAliments , postNewAliment , linkAlimentToVitamine, unlinkAlimentFromVitamine };