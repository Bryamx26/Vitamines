import Page from "../Layouts/Page.jsx";
import { Frieze } from "../Layouts/Decorations.jsx";

const ETAPES = [
    { num: "01", titre: "Découvrir", tone: "butter", texte: "Parcourez les vitamines, leurs bienfaits et les aliments qui en contiennent." },
    { num: "02", titre: "Comprendre", tone: "peach", texte: "Voyez ce qui se passe en cas de carence ou d'excès, sans jargon inutile." },
    { num: "03", titre: "Bientôt : les quiz", tone: "lilac", texte: "Testez vos connaissances et apprenez en vous amusant." },
];

function About() {
    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">03 — Qui sommes-nous</p>
                <h1 className="vt-display vt-hero-title">À propos</h1>
                <Frieze small />
            </section>

            <div className="vt-grid-2">
                <section className="vt-panel tone-sky">
                    <h2 className="vt-display vt-panel-title">Un projet étudiant</h2>
                    <p>
                        Ce site a été conçu <strong>par des étudiants, pour des étudiants</strong>. Il aide à
                        comprendre le rôle des vitamines dans notre corps, en s'amusant.
                    </p>
                </section>
                <section className="vt-panel tone-leaf">
                    <h2 className="vt-display vt-panel-title">Notre objectif</h2>
                    <p>
                        Un contenu clair, visuel et accessible à tous : les vitamines, leurs bienfaits, les effets
                        d'une carence ou d'un excès. Le site évolue : vos suggestions sont les bienvenues.
                    </p>
                </section>
            </div>

            <ol className="vt-steps">
                {ETAPES.map((e) => (
                    <li key={e.num} className={`vt-step tone-${e.tone}`}>
                        <span className="vt-step-num">{e.num}</span>
                        <h2 className="vt-display vt-panel-title">{e.titre}</h2>
                        <p>{e.texte}</p>
                    </li>
                ))}
            </ol>
        </Page>
    );
}

export default About;
