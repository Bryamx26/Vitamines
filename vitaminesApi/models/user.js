const db = require("../db");

const user = {
    async getByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    },

    async postUser(user) {
        const [rows] = await db.query('INSERT INTO users (nom, email, password) VALUES (?, ?, ?)',
            [user.nom, user.email, user.hashedPassword])
        return rows;
    }
};

module.exports = user;
