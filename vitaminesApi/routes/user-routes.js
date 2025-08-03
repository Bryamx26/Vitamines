const express = require('express');
const router = express.Router();

const userController = require("../controllers/user-controller");





/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authentifier un utilisateur
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur authentifié
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Authentification échouée
 */


router.post("/auth", userController.verifyUser);


/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Utilisateurs
 *     summary: Inscrire un nouvel utilisateur
 *     description: Crée un nouvel utilisateur avec un nom, un email et un mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - password
 *             properties:
 *               nom:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MonSuperMotDePasse123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *       400:
 *         description: Requête invalide – champs manquants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Nom, email et mot de passe requis
 *       409:
 *         description: Utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Un compte avec cet email existe déjà
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur serveur
 */
router.post("/register", userController.createUser);


module.exports = router;