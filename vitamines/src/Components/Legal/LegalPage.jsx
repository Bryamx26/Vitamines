import { Link } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import { LEGAL } from "./legalInfo.js";

export const LEGAL_PAGES = [
    { to: "/mentions-legales", label: "Mentions légales" },
    { to: "/confidentialite", label: "Confidentialité" },
    { to: "/avertissement-sante", label: "Avertissement santé" },
    { to: "/sources", label: "Sources" },
];

// Valeur à remplir dans legalInfo.js : affichée en surbrillance tant qu'elle manque.
export function Info({ value, label }) {
    if (value) return value;
    return <mark className="vt-todo">[À compléter : {label}]</mark>;
}

export function formatDate(iso) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Mise en page commune aux pages légales : titre, texte lisible, liens vers les autres pages.
function LegalPage({ eyebrow, title, lead, children }) {
    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">{eyebrow}</p>
                <h1 className="vt-display vt-hero-title vt-legal-title">{title}</h1>
                {lead && <p className="vt-lead">{lead}</p>}
            </section>

            <article className="vt-legal">
                {children}
                <p className="vt-legal-update">Dernière mise à jour : {formatDate(LEGAL.miseAJour)}</p>
            </article>

            <nav className="vt-legal-nav" aria-label="Autres pages légales">
                {LEGAL_PAGES.filter((p) => p.label !== title).map((p) => (
                    <Link key={p.to} to={p.to} className="vt-btn-ghost">{p.label}</Link>
                ))}
            </nav>
        </Page>
    );
}

export default LegalPage;
