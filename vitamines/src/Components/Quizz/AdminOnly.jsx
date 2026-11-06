import { useContext } from "react";
import { Link } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import { UserContext } from "../context/UserContext.jsx";

// Affiche children seulement pour un admin (l'API refuse de toute façon les écritures).
function AdminOnly({ children }) {
    const { user } = useContext(UserContext);
    if (user && user.role === "admin") return children;
    return (
        <Page>
            <section className="vt-card vt-quiz-card vt-quiz">
                <h1 className="vt-display vt-title">Réservé aux administrateurs</h1>
                <p className="vt-lead">Connecte-toi avec un compte administrateur pour gérer les quiz.</p>
                <div className="vt-actions">
                    {!user && <Link to="/Login" className="vt-btn-primary">Connexion</Link>}
                    <Link to="/quiz" className="vt-btn-ghost">Retour au quiz</Link>
                </div>
            </section>
        </Page>
    );
}

export default AdminOnly;
