import { Link } from "react-router-dom";
import { LEGAL_PAGES } from "../Legal/LegalPage.jsx";

function Footer() {
    return (
        <footer className="vt-footer vt-on-tone">
            <p className="vt-footer-disclaimer">
                Informations à but éducatif : elles ne remplacent pas l'avis d'un médecin.
            </p>
            <nav className="vt-footer-links" aria-label="Informations légales">
                {LEGAL_PAGES.map((p) => <Link key={p.to} to={p.to}>{p.label}</Link>)}
            </nav>
            <p>Vitamines — un projet étudiant, par des étudiants, pour des étudiants.</p>
        </footer>
    );
}

export default Footer;
