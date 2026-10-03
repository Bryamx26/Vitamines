import { useState } from "react";
import Page from "../Layouts/Page.jsx";
import VitaminsExhibit from "../Vitamines/VitaminsExhibit.jsx";
import SearchInput from "../Inputs/SearchInput.jsx";

const FAMILLES = [
    {
        titre: "Liposolubles",
        lettres: "A · D · E · K",
        tone: "butter",
        texte: "Elles se dissolvent dans les graisses et sont stockées par l'organisme, surtout dans le foie.",
    },
    {
        titre: "Hydrosolubles",
        lettres: "B · C",
        tone: "sky",
        texte: "Elles se dissolvent dans l'eau et sont peu stockées : il faut en apporter régulièrement.",
    },
];

function Home() {
    const [search, setSearch] = useState('');

    return (
        <Page className="vt-home">
            <section className="vt-hero vt-home-hero">
                <p className="vt-eyebrow">01 — Le guide des vitamines</p>
                <h1 className="vt-display vt-hero-title">Vitamines</h1>
                <p className="vt-lead">
                    Découvrez le rôle de chaque vitamine, ses bienfaits et les aliments où la trouver.
                </p>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
            </section>

            <div className="vt-mini-frieze" aria-hidden="true">
                <span className="vt-shape vt-shape-disc tone-peach"></span>
                <span className="vt-shape vt-shape-pill tone-lilac"></span>
                <span className="vt-shape vt-shape-square"></span>
                <span className="vt-shape vt-shape-disc tone-sky"></span>
            </div>

            <VitaminsExhibit search={search} />

            <div className="vt-families">
                {FAMILLES.map((f) => (
                    <section key={f.titre} className={`vt-panel vt-family tone-${f.tone}`}>
                        <h2 className="vt-display vt-panel-title">{f.titre}</h2>
                        <p className="vt-display vt-family-letters">{f.lettres}</p>
                        <p>{f.texte}</p>
                    </section>
                ))}
            </div>
        </Page>
    )
}

export default Home
