// Normalisation de texte partagée par la migration, le seed et l'API.

// "Œuf" → "oeuf", "Épinard" → "epinard" (sans accents, minuscules)
function normalize(str = "") {
    return String(str)
        .replace(/œ/gi, "oe")
        .replace(/æ/gi, "ae")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();
}

// "Vitamine B12" → "vitamine-b12"
function slugify(str = "") {
    return normalize(str)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

module.exports = { normalize, slugify };
