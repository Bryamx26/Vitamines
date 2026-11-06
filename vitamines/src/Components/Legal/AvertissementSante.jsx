import { Link } from "react-router-dom";
import LegalPage from "./LegalPage.jsx";

function AvertissementSante() {
    return (
        <LegalPage
            eyebrow="À lire avant tout"
            title="Avertissement santé"
            lead="Vitamines est un site éducatif. Il aide à comprendre, il ne soigne pas."
        >
            <section className="vt-panel tone-peach vt-legal-section">
                <h2 className="vt-display vt-panel-title">Pas un avis médical</h2>
                <p>
                    Les informations de ce site (rôles des nutriments, apports conseillés, carences, excès, aliments sources)
                    sont données <strong>à but éducatif</strong>. Elles ne remplacent pas une consultation, un diagnostic
                    ou un traitement par un médecin, un pharmacien ou un diététicien.
                </p>
            </section>

            <section className="vt-panel tone-butter vt-legal-section">
                <h2 className="vt-display vt-panel-title">Compléments alimentaires</h2>
                <p>
                    Ne commencez, n'arrêtez ni ne modifiez un complément ou un traitement sans avis professionnel.
                    Plusieurs vitamines et minéraux sont toxiques à forte dose, et certains interagissent avec des médicaments.
                    Les personnes enceintes ou allaitantes, les enfants, les personnes âgées ou malades ont des besoins particuliers.
                </p>
            </section>

            <section className="vt-panel tone-sky vt-legal-section">
                <h2 className="vt-display vt-panel-title">Des valeurs de référence</h2>
                <p>
                    Les apports affichés sont des repères pour une population en bonne santé, tirés des
                    publications citées sur la page <Link to="/sources">Sources</Link>. Vos besoins personnels peuvent différer.
                    Les recommandations évoluent : vérifiez toujours auprès des organismes officiels.
                </p>
            </section>

            <section className="vt-panel tone-lilac vt-legal-section">
                <h2 className="vt-display vt-panel-title">En cas d'urgence</h2>
                <p>
                    En cas de symptôme inquiétant ou d'ingestion accidentelle d'un complément, appelez le 112, ou le centre
                    antipoison (Belgique : 070 245 245 ; France : centre antipoison de votre région).
                </p>
            </section>
        </LegalPage>
    );
}

export default AvertissementSante;
