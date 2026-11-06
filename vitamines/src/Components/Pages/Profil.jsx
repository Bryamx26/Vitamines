import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import Loading from "./Loading.jsx";
import CreerAdmin from "./CreerAdmin.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { AlertIcon } from "../Icons.jsx";
import { formatDate } from "../Legal/LegalPage.jsx";

// Espace utilisateur : infos du compte, liens utiles, suppression du compte.
function Profil() {
    const API_URL = useAPI();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { logout } = useContext(UserContext);
    const token = localStorage.getItem("token");

    const [compte, setCompte] = useState(null);
    const [chargement, setChargement] = useState(Boolean(token));
    const [confirmation, setConfirmation] = useState(false);
    const [password, setPassword] = useState("");
    const [erreur, setErreur] = useState("");
    const [envoi, setEnvoi] = useState(false);

    const deconnexion = () => {
        logout();
        showNotification("Vous n'êtes plus connecté.", "info");
        navigate("/");
    };

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => {
                if (r.status === 401 || r.status === 404) {
                    // Session expirée ou compte supprimé ailleurs
                    logout();
                    return null;
                }
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(setCompte)
            .catch(() => showNotification("Impossible de charger votre compte.", "error"))
            .finally(() => setChargement(false));
    }, [API_URL, token]); // eslint-disable-line react-hooks/exhaustive-deps

    const supprimer = async (e) => {
        e.preventDefault();
        setErreur("");
        setEnvoi(true);
        try {
            const r = await fetch(`${API_URL}/me`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ password }),
            });
            if (r.status !== 204) {
                const data = await r.json().catch(() => ({}));
                setErreur(data.error || "Suppression impossible, réessayez plus tard.");
                return;
            }
            logout();
            showNotification("Votre compte a été supprimé.", "success");
            navigate("/");
        } catch {
            setErreur("Erreur réseau, réessayez.");
        } finally {
            setEnvoi(false);
        }
    };

    if (chargement) return <Loading />;

    if (!token || !compte) {
        return (
            <Page>
                <section className="vt-card vt-quiz-card vt-quiz">
                    <h1 className="vt-display vt-title">Mon espace</h1>
                    <p className="vt-lead">Connectez-vous pour voir votre compte.</p>
                    <div className="vt-actions">
                        <Link to="/Login" className="vt-btn-primary">Connexion</Link>
                        <Link to="/Register" className="vt-btn-ghost">Créer un compte</Link>
                    </div>
                </section>
            </Page>
        );
    }

    const estAdmin = compte.role === "admin";

    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">Mon espace</p>
                <h1 className="vt-display vt-hero-title vt-legal-title">Bonjour {compte.nom}</h1>
            </section>

            <div className="vt-profil">
                <section className="vt-panel tone-sky vt-legal-section">
                    <h2 className="vt-display vt-panel-title">Mon compte</h2>
                    <dl className="vt-legal-list">
                        <dt>Nom</dt><dd>{compte.nom}</dd>
                        <dt>E-mail</dt><dd>{compte.email}</dd>
                        <dt>Rôle</dt><dd>{estAdmin ? "Administrateur" : "Utilisateur"}</dd>
                        {compte.created_at && <><dt>Inscrit le</dt><dd>{formatDate(compte.created_at)}</dd></>}
                    </dl>
                    <div className="vt-actions">
                        <button type="button" className="vt-btn-ghost" onClick={deconnexion}>Déconnexion</button>
                    </div>
                </section>

                <section className="vt-panel tone-leaf vt-legal-section">
                    <h2 className="vt-display vt-panel-title">Raccourcis</h2>
                    <div className="vt-actions">
                        <Link to="/quiz" className="vt-btn-primary">Faire un quiz</Link>
                        {estAdmin && <Link to="/quiz/gestion" className="vt-btn-ghost">Gérer les quiz</Link>}
                    </div>
                </section>

                {estAdmin && <CreerAdmin />}

                <section className="vt-panel tone-lilac vt-legal-section">
                    <h2 className="vt-display vt-panel-title">Mes données</h2>
                    <p>
                        Nous ne gardons que ce qui est affiché ci-dessus, plus votre mot de passe chiffré.
                        Le détail est dans la <Link to="/confidentialite">politique de confidentialité</Link>.
                        Pour corriger votre nom ou votre e-mail, écrivez-nous via la page <Link to="/Contact">Contact</Link>.
                    </p>
                </section>

                <section className="vt-panel vt-danger-zone vt-legal-section vt-form-section">
                    <h2 className="vt-display vt-panel-title">Supprimer mon compte</h2>
                    <p>
                        La suppression est définitive : votre nom, votre e-mail et votre mot de passe sont effacés tout de suite.
                        {estAdmin && " Les questions de quiz que vous avez créées restent en ligne, sans auteur."}
                    </p>

                    {!confirmation ? (
                        <button type="button" className="vt-btn-ghost vt-btn-danger" onClick={() => setConfirmation(true)}>
                            Supprimer mon compte
                        </button>
                    ) : (
                        <form className="vt-danger-form vt-profil-form" onSubmit={supprimer}>
                            <div className="vt-banner vt-banner-danger" role="alert">
                                <AlertIcon size={20} />
                                <div>
                                    <span className="vt-banner-title">Êtes-vous sûr ?</span>
                                    <p>Cette action ne peut pas être annulée. Entrez votre mot de passe pour confirmer.</p>
                                </div>
                            </div>
                            <div className="vt-field">
                                <label htmlFor="delete-password">Mot de passe</label>
                                <input
                                    className="vt-input"
                                    id="delete-password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={Boolean(erreur)}
                                    aria-describedby={erreur ? "delete-error" : undefined}
                                />
                                {erreur && <p id="delete-error" className="vt-field-error">{erreur}</p>}
                            </div>
                            <div className="vt-actions">
                                <button type="submit" className="vt-btn-primary vt-btn-danger-fill" disabled={envoi || !password}>
                                    {envoi ? "Suppression…" : "Supprimer définitivement"}
                                </button>
                                <button type="button" className="vt-btn-ghost" onClick={() => { setConfirmation(false); setPassword(""); setErreur(""); }}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </div>
        </Page>
    );
}

export default Profil;
