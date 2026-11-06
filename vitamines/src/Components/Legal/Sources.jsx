import LegalPage, { Info } from "./LegalPage.jsx";

const SOURCES = [
    {
        tone: "sky",
        titre: "Conseil Supérieur de la Santé (Belgique)",
        texte: "Recommandations nutritionnelles pour la Belgique, 2016 (avis n° 9285). Source principale des apports conseillés.",
        lien: "https://www.health.belgium.be/fr/avis-9285-recommandations-nutritionnelles-pour-la-belgique-2016",
    },
    {
        tone: "leaf",
        titre: "EFSA — Autorité européenne de sécurité des aliments",
        texte: "Valeurs nutritionnelles de référence (DRV) et limites supérieures de sécurité (UL), utilisées pour compléter ou vérifier les apports.",
        lien: "https://multimedia.efsa.europa.eu/drvs/index.htm",
    },
    {
        tone: "peach",
        titre: "ANSES (France)",
        texte: "Références nutritionnelles et table de composition des aliments Ciqual, pour aller plus loin.",
        lien: "https://ciqual.anses.fr/",
    },
    {
        tone: "butter",
        titre: "Commission européenne — allégations de santé",
        texte: "Registre des allégations nutritionnelles et de santé autorisées (règlement (UE) n° 432/2012). Les bienfaits cités sur le site ne sont pas des allégations commerciales.",
        lien: "https://ec.europa.eu/food/food-feed-portal/screen/health-claims/eu-register",
    },
    {
        tone: "lilac",
        titre: "Notes de cours",
        texte: "Notes de cours « Nut & Diet Q2 » : base de la rédaction des fiches. Chaque apport indique sa source dans la fiche du nutriment.",
    },
];

function Sources() {
    return (
        <LegalPage
            eyebrow="D'où viennent les données"
            title="Sources"
            lead="Les fiches s'appuient sur des sources officielles. Chaque apport conseillé indique sa source sur la fiche du nutriment."
        >
            {SOURCES.map((s) => (
                <section key={s.titre} className={`vt-panel tone-${s.tone} vt-legal-section`}>
                    <h2 className="vt-display vt-panel-title">{s.titre}</h2>
                    <p>{s.texte}</p>
                    {s.lien && (
                        <p>
                            <a href={s.lien} target="_blank" rel="noopener noreferrer">
                                Consulter la source<span className="vt-visually-hidden"> (nouvel onglet)</span>
                            </a>
                        </p>
                    )}
                </section>
            ))}

            <section className="vt-panel tone-sky vt-legal-section">
                <h2 className="vt-display vt-panel-title">Images</h2>
                <p>
                    Illustrations des aliments : <Info label="origine et licence des images (créées pour le projet, banque d'images…)" />.
                </p>
                <p>Polices : Fredoka et Nunito, Google Fonts, licence SIL Open Font License.</p>
            </section>
        </LegalPage>
    );
}

export default Sources;
