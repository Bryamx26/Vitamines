const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/jwt-middleware');
const requireAdmin = require('../middlewares/require-admin');
const controller = require('../controllers/quizz-controller');

// Écritures réservées aux admins. Pas de cache sur les GET : une question modifiée
// doit apparaître tout de suite.
const admin = [authMiddleware, requireAdmin];

/**
 * @swagger
 * components:
 *   schemas:
 *     QuizzReponse:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         texte: { type: string }
 *         statut: { type: string, enum: [correcte, incomplete, fausse] }
 *         explication: { type: string, nullable: true }
 *         ordre: { type: integer }
 *     QuizzQuestion:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         question: { type: string }
 *         correction: { type: string }
 *         nutriments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               slug: { type: string }
 *               nom: { type: string }
 *               symbole: { type: string }
 *               tone: { type: string }
 *         reponses: { type: array, items: { $ref: '#/components/schemas/QuizzReponse' } }
 *     QuizzSaisie:
 *       type: object
 *       required: [question, correction, nutriment_ids, reponses]
 *       properties:
 *         question: { type: string }
 *         correction: { type: string }
 *         nutriment_ids: { type: array, items: { type: integer }, example: [1, 4] }
 *         reponses:
 *           type: array
 *           minItems: 2
 *           description: Au moins une réponse correcte
 *           items:
 *             type: object
 *             required: [texte, statut]
 *             properties:
 *               texte: { type: string }
 *               statut: { type: string, enum: [correcte, incomplete, fausse] }
 *               explication: { type: string }
 */

/**
 * @swagger
 * /api/quizz:
 *   get:
 *     summary: Questions de quiz (filtrables par vitamines)
 *     tags: [Quiz]
 *     parameters:
 *       - { in: query, name: nutriments, description: "Id de vitamines séparés par des virgules (ex. 1,4)", schema: { type: string } }
 *       - { in: query, name: limit, description: "Nombre maximum de questions (50 au plus)", schema: { type: integer } }
 *       - { in: query, name: random, description: "1 = ordre aléatoire", schema: { type: string } }
 *     responses:
 *       200:
 *         description: Questions avec leurs vitamines et leurs réponses
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/QuizzQuestion' } }
 */
router.get('/quizz', controller.getQuizz);

/**
 * @swagger
 * /api/quizz/vitamines:
 *   get:
 *     summary: Vitamines qui ont au moins une question, avec leur nombre de questions
 *     tags: [Quiz]
 *     responses:
 *       200: { description: Liste des vitamines }
 */
router.get('/quizz/vitamines', controller.getQuizzVitamines);

/**
 * @swagger
 * /api/quizz/{id}:
 *   get:
 *     summary: Une question complète
 *     tags: [Quiz]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     responses:
 *       200:
 *         description: Question
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/QuizzQuestion' }
 *       404: { description: Question introuvable }
 *   put:
 *     summary: Modifier une question (admin) — remplace ses vitamines et ses réponses
 *     tags: [Quiz]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/QuizzSaisie' }
 *     responses:
 *       200: { description: Question modifiée }
 *       400: { description: Données invalides }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Question introuvable }
 *   delete:
 *     summary: Supprimer une question (admin)
 *     tags: [Quiz]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { in: path, name: id, required: true, schema: { type: integer } } ]
 *     responses:
 *       204: { description: Question supprimée }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Question introuvable }
 */
router.get('/quizz/:id', controller.getQuestion);
router.put('/quizz/:id', admin, controller.updateQuestion);
router.delete('/quizz/:id', admin, controller.deleteQuestion);

/**
 * @swagger
 * /api/quizz:
 *   post:
 *     summary: Créer une question (admin)
 *     tags: [Quiz]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/QuizzSaisie' }
 *     responses:
 *       201: { description: Question créée }
 *       400: { description: Données invalides }
 *       401: { description: Token manquant ou invalide }
 *       403: { description: Réservé aux administrateurs }
 */
router.post('/quizz', admin, controller.createQuestion);

module.exports = router;
