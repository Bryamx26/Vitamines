// Famille, couleur et stockage d'une vitamine, déduits de sa lettre
// (la base ne stocke pas la famille).

const LIPOSOLUBLES = ["A", "D", "E", "K"];
const HYDROSOLUBLES = ["B", "C"];

// Couleurs propres prioritaires sur la couleur de famille
const OWN_TONES = { A: "peach", B12: "leaf", D: "rose", E: "lilac" };

// "Vitamine B12" → "B12" ; "Vitamine A (Legacy)" → "A"
export function vitamineCode(nom = "") {
    const match = nom.replace(/^vitamine\s*/i, "").match(/^[A-Z]\d*/i);
    return match ? match[0].toUpperCase() : "";
}

export function vitamineFamille(nom, famille) {
    if (famille === "liposoluble" || famille === "hydrosoluble") return famille;
    const lettre = vitamineCode(nom).charAt(0);
    if (LIPOSOLUBLES.includes(lettre)) return "liposoluble";
    if (HYDROSOLUBLES.includes(lettre)) return "hydrosoluble";
    return null;
}

export const FAMILLE_LABELS = {
    liposoluble: "Liposoluble",
    hydrosoluble: "Hydrosoluble",
};

export const FAMILLE_TONES = {
    liposoluble: "butter",
    hydrosoluble: "sky",
};

// Les 6 accents du design system (valeurs de la colonne nutriments.tone)
export const TONES = [
    { value: "leaf", label: "Sauge" },
    { value: "peach", label: "Pêche" },
    { value: "butter", label: "Beurre" },
    { value: "lilac", label: "Lilas" },
    { value: "sky", label: "Ciel" },
    { value: "rose", label: "Rose" },
];
const TONE_VALUES = TONES.map((t) => t.value);

// Accent → classe .tone-* : celui choisi dans l'éditeur (tone) s'il existe,
// sinon une valeur déduite de la lettre
export function vitamineTone(nom, tone) {
    if (TONE_VALUES.includes(tone)) return tone;
    const code = vitamineCode(nom);
    if (OWN_TONES[code]) return OWN_TONES[code];
    return FAMILLE_TONES[vitamineFamille(nom)] ?? "leaf";
}

export function vitamineStockage(nom) {
    if (vitamineCode(nom) === "B12") return "Réserves dans le foie";
    const famille = vitamineFamille(nom);
    if (famille === "liposoluble") return "Dans les graisses et le foie";
    if (famille === "hydrosoluble") return "Peu stockée : apport quotidien";
    return null;
}
