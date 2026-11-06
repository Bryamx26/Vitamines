import { Link } from "react-router-dom";
import LegalPage, { Info } from "./LegalPage.jsx";
import { LEGAL } from "./legalInfo.js";

function MentionsLegales() {
    const { editeur, hebergeur, site } = LEGAL;
    return (
        <LegalPage eyebrow="Informations légales" title="Mentions légales">
            <section className="vt-panel tone-sky vt-legal-section">
                <h2 className="vt-display vt-panel-title">Éditeur du site</h2>
                <p>Le site <strong>{site}</strong> est édité par :</p>
                <dl className="vt-legal-list">
                    <dt>Nom</dt><dd><Info value={editeur.nom} label="nom de l'éditeur" /></dd>
                    <dt>Statut</dt><dd><Info value={editeur.statut} label="statut" /></dd>
                    <dt>Adresse</dt><dd><Info value={editeur.adresse} label="adresse postale, ou retirer cette ligne" /></dd>
                    <dt>Contact</dt><dd>{editeur.email ? <a href={`mailto:${editeur.email}`}>{editeur.email}</a> : <Info label="e-mail de contact" />}</dd>
                </dl>
                <p>Directeur de la publication : <Info value={editeur.nom} label="nom" />.</p>
            </section>

            <section className="vt-panel tone-peach vt-legal-section">
                <h2 className="vt-display vt-panel-title">Hébergement</h2>
                <dl className="vt-legal-list">
                    <dt>Hébergeur</dt><dd><Info value={hebergeur.nom} label="nom de l'hébergeur" /></dd>
                    <dt>Adresse</dt><dd><Info value={hebergeur.adresse} label="adresse de l'hébergeur" /></dd>
                    <dt>Contact</dt><dd><Info value={hebergeur.contact} label="téléphone ou site de l'hébergeur" /></dd>
                </dl>
            </section>

            <section className="vt-panel tone-leaf vt-legal-section">
                <h2 className="vt-display vt-panel-title">Propriété intellectuelle</h2>
                <p>
                    Les textes, la mise en page et le code du site sont la propriété de leur auteur, sauf mention contraire.
                    Les données nutritionnelles proviennent des organismes cités sur la page <Link to="/sources">Sources</Link>.
                    Toute reproduction doit citer le site et ces sources.
                </p>
            </section>

            <section className="vt-panel tone-lilac vt-legal-section">
                <h2 className="vt-display vt-panel-title">Responsabilité</h2>
                <p>
                    Le contenu est fourni à titre éducatif. Malgré le soin apporté, il peut contenir des erreurs :
                    signalez-les via la page <Link to="/Contact">Contact</Link>. Il ne remplace pas l'avis d'un
                    professionnel de santé (voir l'<Link to="/avertissement-sante">avertissement santé</Link>).
                </p>
            </section>

            <section className="vt-panel tone-butter vt-legal-section">
                <h2 className="vt-display vt-panel-title">Données personnelles et cookies</h2>
                <p>
                    Le traitement de vos données est décrit dans la <Link to="/confidentialite">politique de confidentialité</Link>.
                    Le site n'utilise ni cookie publicitaire ni outil de mesure d'audience.
                </p>
            </section>
        </LegalPage>
    );
}

export default MentionsLegales;
