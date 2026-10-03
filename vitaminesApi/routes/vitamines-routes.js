const express = require('express');
const router = express.Router();


//importation du controlleur

const vitaminesController = require('../controllers/vitamines-controller');
const {cacheMiddleware} = require("../middlewares/cache-middleware");
const authMiddleware = require("../middlewares/jwt-middleware");
const requireAdmin = require("../middlewares/require-admin");

// Routes de compatibilité : lues et écrites dans les tables nutriments, même format qu'avant.
const cache = cacheMiddleware(21600);
const admin = [authMiddleware, requireAdmin];



/**
 * @swagger
 * /api/vitamines:
 *   get:
 *     summary: Récupérer toutes les vitamines
 *     tags:
 *       - Vitamines
 *     responses:
 *       200:
 *         description: Liste des vitamines
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
 *                   description:
 *                     type: string
 *                   couleur:
 *                     type: string
 *                   nom_scientifique:
 *                     type: string
 */

router.get("/vitamines", cache, vitaminesController.getVitamines);



/**
 * @swagger
 * /api/vitamines/{id}:
 *   get:
 *     summary: Récupérer une vitamine par son ID
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vitamine trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 description:
 *                   type: string
 *                 couleur:
 *                   type: string
 *                 nom_scientifique:
 *                   type: string
 *       404:
 *         description: Vitamine non trouvée
 */

router.get("/vitamines/:id", cache, vitaminesController.getVitamine);



/**
 * @swagger
 * /api/vitamines/{id}/effects:
 *   get:
 *     summary: Récupérer les effets d'une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des effets
 */
router.get("/vitamines/:id/effects", cache, vitaminesController.getVitamineEffects);


/**
 * @swagger
 * /api/vitamines/{id}/fonctions:
 *   get:
 *     summary: Récupérer les fonctions d'une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des fonctions
 */
router.get("/vitamines/:id/fonctions", cache, vitaminesController.getVitamineFonctions);



/**
 * @swagger
 * /api/vitamines:
 *   post:
 *     summary: Créer une nouvelle vitamine
 *     tags:
 *       - Vitamines
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - couleur
 *               - nom_scientifique
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               couleur:
 *                 type: string
 *               nom_scientifique:
 *                 type: string
 *               tone:
 *                 type: string
 *                 enum: [leaf, peach, butter, lilac, sky, rose]
 *                 description: Accent du design system (fond de la fiche) ; met aussi à jour « couleur »
 *               effets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *               fonctions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Vitamine créée
 *       400:
 *         description: Champs requis manquants
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Réservé aux administrateurs
 */
router.post("/vitamines", admin, vitaminesController.createVitamine);


/**
 * @swagger
 * /api/vitamines/{id}:
 *   put:
 *     summary: Mettre à jour une vitamine
 *     tags:
 *       - Vitamines
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - couleur
 *               - nom_scientifique
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               couleur:
 *                 type: string
 *               nom_scientifique:
 *                 type: string
 *               tone:
 *                 type: string
 *                 enum: [leaf, peach, butter, lilac, sky, rose]
 *                 description: Accent du design system (fond de la fiche) ; met aussi à jour « couleur »
 *               effets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *               fonctions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Vitamine mise à jour
 *       500:
 *         description: Erreur mise à jour
 */

router.put("/vitamines/:id", admin, vitaminesController.updateVitamine);


/**
 * @swagger
 * /api/vitamines/{id}:
 *   delete:
 *     summary: Supprimer une vitamine
 *     tags:
 *       - Vitamines
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vitamine supprimée
 *       404:
 *         description: Vitamine non trouvée
 */

router.delete("/vitamines/:id", admin, vitaminesController.deleteVitamine);



module.exports = router;
