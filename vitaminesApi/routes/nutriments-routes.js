const express = require('express');
const router = express.Router();

const controller = require('../controllers/nutriments-controller');
const authMiddleware = require('../middlewares/jwt-middleware');
const requireAdmin = require('../middlewares/require-admin');
const { cacheMiddleware } = require('../middlewares/cache-middleware');

const cache = cacheMiddleware(21600);
const admin = [authMiddleware, requireAdmin];

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   parameters:
 *     IdOuSlug:
 *       in: path
 *       name: idOuSlug
 *       required: true
 *       description: Id numérique (ex. 36) ou slug (ex. vitamine-b12, fer)
 *       schema:
 *         type: string
 *   schemas:
 *     Apport:
 *       type: object
 *       properties:
 *         population: { type: string, enum: [adulte, homme, femme, grossesse, allaitement, enfant] }
 *         type: { type: string, enum: [recommande, adequat, max, min, supplement] }
 *         valeur_min: { type: number }
 *         valeur_max: { type: number, nullable: true }
 *         unite: { type: string, example: "mg/j" }
 *         source: { type: string, example: "CSS 2016" }
 *         note: { type: string }
 *         a_verifier: { type: boolean }
 *     NutrimentResume:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         slug: { type: string }
 *         nom: { type: string }
 *         symbole: { type: string }
 *         nom_scientifique: { type: string }
 *         categorie: { type: string, enum: [vitamine, mineral, oligo-element] }
 *         famille: { type: string, enum: [liposoluble, hydrosoluble], nullable: true }
 *         tone: { type: string, enum: [leaf, peach, butter, lilac, sky, rose] }
 *         couleur: { type: string, example: "#f8cdb3" }
 *         apport_principal: { $ref: '#/components/schemas/Apport' }
 *     NutrimentComplet:
 *       allOf:
 *         - $ref: '#/components/schemas/NutrimentResume'
 *         - type: object
 *           properties:
 *             description: { type: string }
 *             absorption: { type: string }
 *             metabolisme: { type: string }
 *             stockage: { type: string }
 *             elimination: { type: string }
 *             quantite_corps: { type: string }
 *             unites: { type: string }
 *             apports_note: { type: string }
 *             aliments_source: { type: string }
 *             formes: { type: array, items: { type: object, properties: { nom: { type: string }, description: { type: string } } } }
 *             fonctions: { type: array, items: { type: object, properties: { id: { type: integer }, nom: { type: string }, description: { type: string } } } }
 *             effets:
 *               type: object
 *               description: Effets groupés par type
 *               properties:
 *                 avantage: { type: array, items: { type: object } }
 *                 carence: { type: array, items: { type: object } }
 *                 exces: { type: array, items: { type: object } }
 *                 interaction: { type: array, items: { type: object } }
 *             allegations: { type: array, items: { type: object, properties: { texte: { type: string }, source: { type: string } } } }
 *             apports: { type: array, items: { $ref: '#/components/schemas/Apport' } }
 *             aliments: { type: array, items: { type: object, properties: { id: { type: integer }, nom: { type: string }, path: { type: string, nullable: true } } } }
 *             interactions: { type: array, items: { type: object } }
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Catégories de nutriments et nombre de nutriments par catégorie
 *     tags: [Nutriments]
 *     responses:
 *       200:
 *         description: Liste des catégories
 */
router.get('/categories', cache, controller.getCategories);

/**
 * @swagger
 * /api/nutriments:
 *   get:
 *     summary: Liste légère des nutriments (filtrable)
 *     tags: [Nutriments]
 *     parameters:
 *       - { in: query, name: categorie, schema: { type: string, enum: [vitamine, mineral, oligo-element] } }
 *       - { in: query, name: famille, schema: { type: string, enum: [liposoluble, hydrosoluble] } }
 *       - { in: query, name: q, description: Recherche dans le nom, le slug, le nom scientifique ou le symbole, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Nutriments
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/NutrimentResume' } }
 */
router.get('/nutriments', cache, controller.getNutriments);

/**
 * @swagger
 * /api/nutriments/{idOuSlug}:
 *   get:
 *     summary: Nutriment complet (formes, fonctions, effets, allégations, apports, aliments, interactions)
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200:
 *         description: Nutriment
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NutrimentComplet' }
 *       404: { description: Nutriment non trouvé }
 */
router.get('/nutriments/:idOuSlug', cache, controller.getNutriment);

/**
 * @swagger
 * /api/nutriments/{idOuSlug}/apports:
 *   get:
 *     summary: Apports conseillés et maximaux d'un nutriment
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Apports }
 *       404: { description: Nutriment non trouvé }
 * /api/nutriments/{idOuSlug}/fonctions:
 *   get:
 *     summary: Fonctions d'un nutriment
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Fonctions }
 *       404: { description: Nutriment non trouvé }
 * /api/nutriments/{idOuSlug}/effets:
 *   get:
 *     summary: Effets d'un nutriment, groupés par type (avantage, carence, exces, interaction)
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Effets }
 *       404: { description: Nutriment non trouvé }
 * /api/nutriments/{idOuSlug}/formes:
 *   get:
 *     summary: Formes chimiques d'un nutriment
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Formes }
 *       404: { description: Nutriment non trouvé }
 * /api/nutriments/{idOuSlug}/aliments:
 *   get:
 *     summary: Aliments sources d'un nutriment
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Aliments (id, nom, type, path, teneur) }
 *       404: { description: Nutriment non trouvé }
 * /api/nutriments/{idOuSlug}/interactions:
 *   get:
 *     summary: Interactions d'un nutriment avec d'autres nutriments ou substances
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Interactions }
 *       404: { description: Nutriment non trouvé }
 * /api/nutriments/{idOuSlug}/allegations:
 *   get:
 *     summary: Allégations de santé autorisées
 *     tags: [Nutriments]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Allégations }
 *       404: { description: Nutriment non trouvé }
 */
for (const name of ['apports', 'fonctions', 'effets', 'formes', 'aliments', 'interactions', 'allegations']) {
    router.get(`/nutriments/:idOuSlug/${name}`, cache, controller.getSubList(name));
}

/**
 * @swagger
 * /api/aliments/{id}/nutriments:
 *   get:
 *     summary: Nutriments apportés par un aliment
 *     tags: [Nutriments, Aliments]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Nutriments de l'aliment }
 *       404: { description: Aliment non trouvé }
 */
router.get('/aliments/:id/nutriments', cache, controller.getAlimentNutriments);

/**
 * @swagger
 * /api/nutriments:
 *   post:
 *     summary: Créer un nutriment (admin)
 *     tags: [Nutriments]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       description: Même forme que l'objet complet ; « categorie » est un code, « aliments » une liste d'id
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NutrimentComplet' }
 *     responses:
 *       201: { description: Nutriment créé (objet complet) }
 *       400: { description: Corps invalide }
 *       401: { description: Token manquant ou invalide }
 *       403: { description: Réservé aux administrateurs }
 *       409: { description: Slug déjà utilisé }
 */
router.post('/nutriments', admin, controller.createNutriment);

/**
 * @swagger
 * /api/nutriments/{idOuSlug}:
 *   put:
 *     summary: Mettre à jour un nutriment (admin) — seules les clés présentes sont remplacées
 *     tags: [Nutriments]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NutrimentComplet' }
 *     responses:
 *       200: { description: Nutriment mis à jour (objet complet) }
 *       400: { description: Corps invalide }
 *       401: { description: Token manquant ou invalide }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Nutriment non trouvé }
 *   delete:
 *     summary: Supprimer un nutriment (admin)
 *     tags: [Nutriments]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     responses:
 *       200: { description: Nutriment supprimé }
 *       401: { description: Token manquant ou invalide }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Nutriment non trouvé }
 */
router.put('/nutriments/:idOuSlug', admin, controller.updateNutriment);
router.delete('/nutriments/:idOuSlug', admin, controller.deleteNutriment);

/**
 * @swagger
 * /api/nutriments/{idOuSlug}/aliments:
 *   put:
 *     summary: Remplacer les aliments sources d'un nutriment (admin)
 *     tags: [Nutriments]
 *     security: [ { bearerAuth: [] } ]
 *     parameters: [ { $ref: '#/components/parameters/IdOuSlug' } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aliments:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - { type: integer }
 *                     - { type: object, properties: { id: { type: integer }, teneur: { type: string } } }
 *     responses:
 *       200: { description: Nouvelle liste d'aliments }
 *       400: { description: Liste invalide ou aliment inconnu }
 *       401: { description: Token manquant ou invalide }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Nutriment non trouvé }
 */
router.put('/nutriments/:idOuSlug/aliments', admin, controller.setNutrimentAliments);

module.exports = router;
