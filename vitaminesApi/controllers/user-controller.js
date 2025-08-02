const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


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

        // On supprime le mot de passe avant de renvoyer la réponse
        const { password: _, ...safeUser } = user;

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_PRIVATE.replace(/\\n/g, '\n'),  // 👈 important !
            {
                algorithm: 'RS256',
                expiresIn: '6h',
            }
        );

        res.status(200).json(safeUser);
        console.log(token);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

module.exports = { verifyUser };
