// Questions de quiz d'exemple depuis data/quizz-exemples.json.
//   npm run seed:quizz
//
// Ne fait rien si la table quizz contient déjà des questions (relançable sans doublon).

require("dotenv").config();
const path = require("path");
const db = require("../db");
const Quizz = require("../models/quizz");

const DATA_FILE = path.join(__dirname, "..", "data", "quizz-exemples.json");

async function main() {
    const [[{ n }]] = await db.query("SELECT COUNT(*) AS n FROM quizz");
    if (n > 0) {
        console.log(`La table quizz contient déjà ${n} question(s) : rien à faire.`);
        return;
    }
    const questions = require(DATA_FILE);
    for (const q of questions) {
        const [rows] = await db.query("SELECT id FROM nutriments WHERE slug IN (?)", [q.nutriments]);
        if (rows.length !== q.nutriments.length) {
            throw new Error(`Nutriment introuvable pour « ${q.question} »`);
        }
        await Quizz.create({ ...q, nutriment_ids: rows.map((r) => r.id) }, null);
    }
    console.log(`${questions.length} question(s) d'exemple ajoutée(s).`);
}

main()
    .catch((err) => {
        console.error("Seed quiz échoué :", err.message);
        process.exitCode = 1;
    })
    .finally(() => db.end());
