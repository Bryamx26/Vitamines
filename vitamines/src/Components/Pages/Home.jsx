import { useState } from "react";
import Page from "../Layouts/Page.jsx";
import VitaminsExhibit from "../Vitamines/VitaminsExhibit.jsx";
import SearchInput from "../Inputs/SearchInput.jsx";
import { Frieze } from "../Layouts/Decorations.jsx";


function Home() {
    const [search, setSearch] = useState('');

    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">01 — Le guide des vitamines</p>
                <h1 className="vt-display vt-hero-title">Vitamines</h1>
                <p className="vt-lead">
                    À quoi sert chaque vitamine, où la trouver et combien en consommer chaque jour :
                    l'essentiel, simplement.
                </p>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
                <Frieze />
            </section>

            <VitaminsExhibit search={search} />

            <div className="vt-grid-2">
                <section className="vt-panel tone-butter">
                    <h2 className="vt-display vt-panel-title">Liposolubles — A · D · E · K</h2>
                    <p>Elles se dissolvent dans les graisses. Le corps les stocke dans le foie et les tissus adipeux.</p>
                </section>
                <section className="vt-panel tone-sky">
                    <h2 className="vt-display vt-panel-title">Hydrosolubles — B · C</h2>
                    <p>Elles se dissolvent dans l'eau. L'excédent est éliminé : il faut en consommer régulièrement.</p>
                </section>
            </div>
        </Page>
    )
}

export default Home
