const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { invalidateCacheByKey } = require('../middlewares/cache-middleware');


async function verifyUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    try {

        const users = await User.getByEmail(email);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Utilisateur non trouvé ou mot de passe incorrect' });
        }

        const user = users[0];

        // Comparaison du mot de passe hashé
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Utilisateur non trouvé ou mot de passe incorrect' });
        }




        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // role : lu par requireAdmin
            process.env.JWT_PRIVATE.replace(/\\n/g, '\n'),  // 👈 important !
            {
                algorithm: 'RS256',
                expiresIn: '6h',
            }
        );
        user.token = token;
        // On supprime le mot de passe avant de renvoyer la réponse
        const { password: _, ...safeUser } = user;
        res.status(200).json(safeUser);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

async function createUser(req, res) {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
        return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Adresse e-mail invalide' });
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, dont une lettre et un chiffre.' });
    }

    try {
        const existing = await User.getByEmail(email);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Un compte avec cet email existe déjà' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            nom,
            email,
            hashedPassword
        };

        const insertId = await User.postUser(userData);

        invalidateCacheByKey('/api/register');


        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: insertId,
                nom,
                email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// Profil de l'utilisateur connecté (sans le mot de passe)
async function getMe(req, res) {
    try {
        const user = await User.getById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }
        const { password: _, ...safeUser } = user;
        res.status(200).json(safeUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

// Suppression de son propre compte (droit à l'effacement, RGPD art. 17).
// Le mot de passe est redemandé : un token volé ne suffit pas à supprimer le compte.
async function deleteMe(req, res) {
    const { password } = req.body || {};

    if (!password) {
        return res.status(400).json({ error: 'Mot de passe requis pour confirmer la suppression' });
    }

    try {
        const user = await User.getById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Compte introuvable' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // Le site doit garder au moins un administrateur
        if (user.role === 'admin' && await User.countAdmins() <= 1) {
            return res.status(409).json({ error: 'Vous êtes le dernier administrateur : nommez-en un autre avant de supprimer ce compte.' });
        }

        await User.deleteById(user.id);
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

module.exports = { verifyUser, createUser, getMe, deleteMe };
