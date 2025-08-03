const express = require('express');
const router = express.Router();


//importation du controlleur

const vitaminesController = require('../controllers/vitamines-controller');



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

router.get("/vitamines", vitaminesController.getVitamines);



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

router.get("/vitamines/:id", vitaminesController.getVitamine);



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
router.get("/vitamines/:id/effects", vitaminesController.getVitamineEffects);


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
router.get("/vitamines/:id/fonctions", vitaminesController.getVitamineFonctions);



/**
 * @swagger
 * /api/vitamines:
 *   post:
 *     summary: Créer une nouvelle vitamine
 *     tags:
 *       - Vitamines
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
 */
router.post("/vitamines", vitaminesController.createVitamine);


/**
 * @swagger
 * /api/vitamines/{id}:
 *   put:
 *     summary: Mettre à jour une vitamine
 *     tags:
 *       - Vitamines
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

router.put("/vitamines/:id", vitaminesController.updateVitamine);


/**
 * @swagger
 * /api/vitamines/{id}:
 *   delete:
 *     summary: Supprimer une vitamine
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
 *         description: Vitamine supprimée
 *       404:
 *         description: Vitamine non trouvée
 */

router.delete("/vitamines/:id", vitaminesController.deleteVitamine);



module.exports = router;
