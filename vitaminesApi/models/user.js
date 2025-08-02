const db = require("../db");

const user = {
    async getByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    }
};

module.exports = user;
