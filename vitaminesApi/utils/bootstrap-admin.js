// Crée le premier administrateur depuis le .env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NOM).
// - Ne fait rien si les variables sont vides.
// - Ne fait rien dès qu'un admin existe : jamais d'écrasement ni de réinitialisation au redémarrage.
// - Ne promeut pas un compte existant avec cet email (quelqu'un a pu s'inscrire avec avant).
const bcrypt = require('bcrypt');
const User = require('../models/user');

const MAX_TENTATIVES = 30; // MySQL peut mettre du temps au premier démarrage (import d'init.sql)
const DELAI_MS = 2000;

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function motDePasseValide(password) {
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return 'au moins 8 caractères, dont une lettre et un chiffre';
    }
    if (/change-?moi|password|motdepasse|admin123/i.test(password)) {
        return 'valeur d\'exemple refusée, choisissez un vrai mot de passe';
    }
    return null;
}

async function bootstrapAdmin() {
    const email = (process.env.ADMIN_EMAIL || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';
    const nom = (process.env.ADMIN_NOM || 'Administrateur').trim();

    if (!email || !password) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('[admin] ADMIN_EMAIL invalide : aucun compte créé.');
        return;
    }
    const erreur = motDePasseValide(password);
    if (erreur) {
        console.error(`[admin] ADMIN_PASSWORD refusé (${erreur}) : aucun compte créé.`);
        return;
    }

    for (let tentative = 1; tentative <= MAX_TENTATIVES; tentative++) {
        try {
            if (await User.countAdmins() > 0) {
                console.log('[admin] Un administrateur existe déjà : rien à faire.');
                return;
            }
            if ((await User.getByEmail(email)).length > 0) {
                console.warn(`[admin] Un compte ${email} existe déjà sans être admin : il n'est pas promu automatiquement.`);
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.postUser({ nom, email, hashedPassword, role: 'admin' });
            console.log(`[admin] Administrateur ${email} créé. Changez son mot de passe ou retirez ADMIN_PASSWORD du .env.`);
            return;
        } catch (err) {
            if (tentative === MAX_TENTATIVES) {
                console.error('[admin] Base inaccessible, administrateur non créé :', err.message);
                return;
            }
            await attendre(DELAI_MS);
        }
    }
}

module.exports = bootstrapAdmin;
