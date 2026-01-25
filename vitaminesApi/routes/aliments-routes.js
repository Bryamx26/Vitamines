const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/jwt-middleware");
const alimentsController = require("../controllers/aliments-controller");
const upload = require("../middlewares/uploadMiddleware");


/**
 * @swagger
 * /api/aliments:
 *   get:
 *     summary: Récupérer tous les aliments
 *     tags:
 *       - Aliments
 *     responses:
 *       200:
 *         description: Liste des aliments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   type:
 *                     type: string
 *
 */

router.get("/aliments", alimentsController.getAllAliments);




/**
 * @swagger
 * /api/aliments/{nom}:
 *   get:
 *     summary: Récupérer les aliments associées a une vitamine
 *     tags:
 *       - Aliments
 *     parameters:
 *       - in: path
 *         name: nom
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aliment trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 type:
 *                   type: string
 *
 *       404:
 *         description: Aliments non trouvés
 */

router.get("/aliments/:nom", alimentsController.getAliments);



router.post("/uploadAliment", upload.single("File"), alimentsController.postNewAliment);

/**
 * @swagger
 * /api/aliments/associate:
 *   post:
 *     summary: Associer un aliment à une vitamine
 *     tags:
 *       - Aliments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alimentId:
 *                 type: integer
 *               vitamineId:
 *                 type: integer
 */

router.post("/aliments/associate", alimentsController.linkAlimentToVitamine);

/**
 * @swagger
 * /api/aliments/dissociate:
 *   delete:
 *     summary: Supprimer le lien entre un aliment et une vitamine
 *     tags:
 *       - Aliments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alimentId:
 *                 type: integer
 *               vitamineId:
 *                 type: integer
 */

router.delete("/aliments/dissociate", alimentsController.unlinkAlimentFromVitamine);


module.exports = router;