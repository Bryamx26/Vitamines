const multer = require("multer");
const path = require("path");

// Fichier gardé en mémoire : le contrôleur le valide puis l'écrit lui-même
// dans le dossier d'images (nom généré côté serveur, jamais le nom envoyé).
const ALLOWED = {
    "image/png": ".png",
    "image/svg+xml": ".svg",
};

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED[file.mimetype] && ALLOWED[file.mimetype] === ext) cb(null, true);
    else cb(Object.assign(new Error("Seuls les fichiers SVG et PNG sont acceptés."), { status: 400 }));
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

// Renvoie une erreur 400 lisible au lieu d'une page d'erreur Express
function uploadSingle(field) {
    const handler = upload.single(field);
    return (req, res, next) => {
        handler(req, res, (err) => {
            if (!err) return next();
            const message = err.code === "LIMIT_FILE_SIZE" ? "Fichier trop lourd (2 Mo maximum)." : err.message;
            res.status(400).json({ error: message });
        });
    };
}

module.exports = { uploadSingle, ALLOWED };
