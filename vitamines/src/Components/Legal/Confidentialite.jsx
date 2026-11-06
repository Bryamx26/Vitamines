import { Link } from "react-router-dom";
import LegalPage, { Info } from "./LegalPage.jsx";
import { LEGAL } from "./legalInfo.js";

function Confidentialite() {
    const { editeur, hebergeur } = LEGAL;
    const contact = editeur.email
        ? <a href={`mailto:${editeur.email}`}>{editeur.email}</a>
        : <Info label="e-mail de contact" />;

    return (
        <LegalPage
            eyebrow="RGPD"
            title="Confidentialité"
            lead="Ce que nous savons de vous, pourquoi, et comment le supprimer. En bref : le strict minimum pour faire fonctionner votre compte."
        >
            <section className="vt-panel tone-sky vt-legal-section">
                <h2 className="vt-display vt-panel-title">Responsable du traitement</h2>
                <p><Info value={editeur.nom} label="nom" />, joignable à {contact}.</p>
            </section>

            <section className="vt-panel tone-leaf vt-legal-section">
                <h2 className="vt-display vt-panel-title">Données collectées</h2>
                <p>Vous pouvez consulter le site sans compte. Si vous en créez un, nous enregistrons :</p>
                <ul>
                    <li>votre <strong>nom</strong> et votre <strong>adresse e-mail</strong> ;</li>
                    <li>votre <strong>mot de passe</strong>, uniquement sous forme chiffrée (hachage bcrypt) : personne ne peut le lire ;</li>
                    <li>la <strong>date de création</strong> du compte et son <strong>rôle</strong> (utilisateur ou administrateur) ;</li>
                    <li>pour les administrateurs, le lien entre leur compte et les questions de quiz qu'ils ont créées.</li>
                </ul>
                <p>Vos réponses aux quiz ne sont pas enregistrées.</p>
            </section>

            <section className="vt-panel tone-peach vt-legal-section">
                <h2 className="vt-display vt-panel-title">Pourquoi</h2>
                <p>
                    Uniquement pour créer votre compte, vous connecter et réserver certaines fonctions aux administrateurs.
                    Base légale : l'exécution du service que vous demandez en créant un compte (art. 6.1.b du RGPD).
                    Pas de publicité, pas de revente, pas de profilage.
                </p>
            </section>

            <section className="vt-panel tone-butter vt-legal-section">
                <h2 className="vt-display vt-panel-title">Durée de conservation</h2>
                <p>
                    Vos données sont gardées tant que votre compte existe. Quand vous le supprimez, elles sont effacées
                    immédiatement de la base. Les questions de quiz créées restent publiées, sans auteur.
                </p>
                <p>
                    Pour limiter les attaques, l'adresse IP des tentatives de connexion est gardée en mémoire au plus une heure,
                    jamais enregistrée en base. Journaux techniques de l'hébergeur : <Info label="durée de conservation des logs" />.
                </p>
            </section>

            <section className="vt-panel tone-lilac vt-legal-section">
                <h2 className="vt-display vt-panel-title">Stockage dans votre navigateur</h2>
                <p>
                    Le site n'utilise <strong>aucun cookie</strong>. Il garde dans le stockage local de votre navigateur
                    votre jeton de connexion (valable 6 heures) et votre choix de thème clair ou sombre. Ces éléments sont
                    nécessaires au fonctionnement du site : aucun consentement n'est demandé. La déconnexion efface le jeton.
                </p>
            </section>

            <section className="vt-panel tone-sky vt-legal-section">
                <h2 className="vt-display vt-panel-title">Qui y a accès</h2>
                <p>
                    Seul l'éditeur du site. Les données sont stockées chez l'hébergeur : <Info value={hebergeur.nom} label="nom et pays de l'hébergeur" />.
                    Les polices d'écriture sont chargées depuis Google Fonts, qui reçoit donc votre adresse IP lors de l'affichage des pages.
                </p>
            </section>

            <section className="vt-panel tone-leaf vt-legal-section">
                <h2 className="vt-display vt-panel-title">Vos droits</h2>
                <p>Vous pouvez à tout moment :</p>
                <ul>
                    <li><strong>consulter</strong> vos données et <strong>supprimer votre compte</strong> vous-même depuis <Link to="/profil">Mon espace</Link> ;</li>
                    <li>demander leur <strong>rectification</strong>, une <strong>copie</strong> (portabilité) ou vous <strong>opposer</strong> au traitement en écrivant à {contact}.</li>
                </ul>
                <p>
                    Nous répondons sous un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez
                    saisir l'<a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer">Autorité de protection des données</a> (Belgique)
                    ou la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a> (France).
                </p>
            </section>

            <section className="vt-panel tone-peach vt-legal-section">
                <h2 className="vt-display vt-panel-title">Sécurité</h2>
                <p>
                    Connexion chiffrée (HTTPS), mots de passe hachés, nombre de tentatives de connexion limité.
                    La suppression du compte redemande le mot de passe.
                </p>
            </section>
        </LegalPage>
    );
}

export default Confidentialite;
