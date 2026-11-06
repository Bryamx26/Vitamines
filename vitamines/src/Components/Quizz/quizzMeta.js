// Statuts des réponses et verdict d'une question (page Quiz et créateur).

export const STATUTS = [
    { value: "correcte", label: "Correcte" },
    { value: "incomplete", label: "Incomplète" },
    { value: "fausse", label: "Fausse" },
];

export const STATUT_LABELS = Object.fromEntries(STATUTS.map((s) => [s.value, s.label]));

export const VERDICTS = {
    juste: { label: "Juste", tone: "leaf" },
    partiel: { label: "Partiel", tone: "butter" },
    faux: { label: "Faux", tone: "rose" },
};

// Juste : toutes les réponses correctes cochées et aucune fausse.
// Partiel : au moins une réponse correcte ou incomplète cochée, sans tout avoir.
// Faux : sinon.
export function verdict(question, coches) {
    const cochees = question.reponses.filter((r) => coches.has(r.id));
    const correctes = question.reponses.filter((r) => r.statut === "correcte");
    const toutes = correctes.every((r) => coches.has(r.id));
    const fausse = cochees.some((r) => r.statut === "fausse");
    if (toutes && !fausse) return "juste";
    if (cochees.some((r) => r.statut !== "fausse")) return "partiel";
    return "faux";
}

// Mélange de Fisher-Yates (copie)
export function melanger(liste) {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
}

export const toneOf = (n) => n.tone || "leaf";
