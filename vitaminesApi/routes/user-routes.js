const express = require('express');
const router = express.Router();

const userController = require("../controllers/user-controller");
const rateLimit = require("../middlewares/rate-limit");
const authMiddleware = require("../middlewares/jwt-middleware");
const requireAdmin = require("../middlewares/require-admin");

// Protection contre les essais de mots de passe en série
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
});
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Trop d'inscriptions depuis cette adresse. Réessayez plus tard.",
});
// Suppression de compte : le mot de passe est redemandé, on limite aussi les essais
const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Trop de tentatives. Réessayez dans quelques minutes.",
});






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
 *       429:
 *         description: Trop de tentatives (10 par 15 minutes et par IP)
 */


router.post("/auth", authLimiter, userController.verifyUser);


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
router.post("/register", registerLimiter, userController.createUser);


/**
 * @swagger
 * /admins:
 *   post:
 *     tags:
 *       - Utilisateurs
 *     summary: Créer un compte administrateur (réservé aux administrateurs)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, email, password]
 *             properties:
 *               nom: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password, description: "8 caractères minimum, dont une lettre et un chiffre" }
 *     responses:
 *       201:
 *         description: Administrateur créé
 *       400:
 *         description: Champs manquants ou invalides
 *       401:
 *         description: Token manquant, invalide ou expiré
 *       403:
 *         description: Accès réservé aux administrateurs
 *       409:
 *         description: Un compte avec cet email existe déjà
 */
router.post("/admins", registerLimiter, authMiddleware, requireAdmin, userController.createAdmin);


/**
 * @swagger
 * /me:
 *   get:
 *     tags:
 *       - Utilisateurs
 *     summary: Profil de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: id, nom, email, role, created_at (jamais le mot de passe)
 *       401:
 *         description: Token manquant, invalide ou expiré
 *       404:
 *         description: Compte introuvable (déjà supprimé)
 */
router.get("/me", authMiddleware, userController.getMe);


/**
 * @swagger
 * /me:
 *   delete:
 *     tags:
 *       - Utilisateurs
 *     summary: Supprimer son propre compte
 *     description: >
 *       Supprime définitivement le compte de l'utilisateur connecté. Le mot de passe est redemandé.
 *       Les questions de quiz qu'il a créées sont conservées, sans auteur.
 *       Le dernier administrateur ne peut pas supprimer son compte.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       204:
 *         description: Compte supprimé
 *       400:
 *         description: Mot de passe manquant
 *       401:
 *         description: Token invalide ou mot de passe incorrect
 *       404:
 *         description: Compte introuvable
 *       409:
 *         description: Dernier administrateur
 *       429:
 *         description: Trop de tentatives (10 par 15 minutes et par IP)
 */
router.delete("/me", deleteLimiter, authMiddleware, userController.deleteMe);


module.exports = router;