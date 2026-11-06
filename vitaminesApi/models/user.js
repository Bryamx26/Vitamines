const db = require("../db");

const user = {
    async getByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    },

    async postUser(user) {
        const [rows] = await db.query('INSERT INTO users (nom, email, password) VALUES (?, ?, ?)',
            [user.nom, user.email, user.hashedPassword])
        return rows.insertId;
    },

    async getById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async countAdmins() {
        const [rows] = await db.query("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
        return rows[0].n;
    },

    // Les questions de quiz créées gardent leur contenu (created_by passe à NULL, voir init.sql).
    async deleteById(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = user;
