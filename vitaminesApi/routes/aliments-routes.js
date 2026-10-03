const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/jwt-middleware");
const alimentsController = require("../controllers/aliments-controller");
const { uploadSingle } = require("../middlewares/uploadMiddleware");
const requireAdmin = require("../middlewares/require-admin");

// Écritures sur les aliments : réservées aux admins
const admin = [authMiddleware, requireAdmin];
const { cacheMiddleware } = require("../middlewares/cache-middleware");

const cache = cacheMiddleware(21600);


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

router.get("/aliments", cache, alimentsController.getAllAliments);




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

router.get("/aliments/:nom", cache, alimentsController.getAliments);



/**
 * @swagger
 * /api/uploadAliment:
 *   post:
 *     summary: Ajouter un aliment avec son image (admin)
 *     tags:
 *       - Aliments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               type: { type: string }
 *               json: { type: string }
 *               File: { type: string, format: binary, description: "PNG ou SVG, 2 Mo maximum" }
 *     responses:
 *       201: { description: Aliment créé }
 *       400: { description: Fichier ou champs invalides }
 *       401: { description: Token manquant ou invalide }
 *       403: { description: Réservé aux administrateurs }
 */
router.post("/uploadAliment", admin, uploadSingle("File"), alimentsController.postNewAliment);

/**
 * @swagger
 * /api/aliments/associate:
 *   post:
 *     summary: Associer un aliment à une vitamine
 *     tags:
 *       - Aliments
 *     security:
 *       - bearerAuth: []
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

router.post("/aliments/associate", admin, alimentsController.linkAlimentToVitamine);

/**
 * @swagger
 * /api/aliments/dissociate:
 *   delete:
 *     summary: Supprimer le lien entre un aliment et une vitamine
 *     tags:
 *       - Aliments
 *     security:
 *       - bearerAuth: []
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

router.delete("/aliments/dissociate", admin, alimentsController.unlinkAlimentFromVitamine);


module.exports = router;