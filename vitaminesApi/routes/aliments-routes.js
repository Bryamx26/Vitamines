const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/jwt-middleware");
const alimentsController = require("../controllers/aliments-controller");


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
module.exports = router;