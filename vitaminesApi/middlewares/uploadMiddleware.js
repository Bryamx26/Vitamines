const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Créer le dossier uploads si nécessaire
fs.mkdir(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Conserver le nom original
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/svg+xml" || file.mimetype === "image/png") cb(null, true);
    else cb(new Error("Seuls les fichiers SVG et PNG sont acceptés !"));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
