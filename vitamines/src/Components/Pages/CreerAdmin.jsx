import { useState } from "react";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

const VIDE = { nom: "", email: "", password: "" };

// Panneau de « Mon espace » réservé aux administrateurs : crée un nouveau compte admin
function CreerAdmin() {
    const API_URL = useAPI();
    const { showNotification } = useNotification();

    const [champs, setChamps] = useState(VIDE);
    const [erreur, setErreur] = useState("");
    const [envoi, setEnvoi] = useState(false);

    const onChange = ({ target: { name, value } }) => setChamps((c) => ({ ...c, [name]: value }));

    const motDePasseValide = champs.password.length >= 8 && /[A-Za-z]/.test(champs.password) && /\d/.test(champs.password);

    const creer = async (e) => {
        e.preventDefault();
        setErreur("");
        if (!motDePasseValide) {
            setErreur("Le mot de passe doit contenir au moins 8 caractères, dont une lettre et un chiffre.");
            return;
        }
        setEnvoi(true);
        try {
            const r = await fetch(`${API_URL}/admins`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify(champs),
            });
            const data = await r.json().catch(() => ({}));
            if (r.status !== 201) {
                setErreur(data.message || data.error || "Création impossible, réessayez plus tard.");
                return;
            }
            showNotification(`Administrateur ${champs.nom} créé.`, "success");
            setChamps(VIDE);
        } catch {
            setErreur("Erreur réseau, réessayez.");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <section className="vt-panel tone-butter vt-legal-section vt-form-section">
            <h2 className="vt-display vt-panel-title">Créer un administrateur</h2>
            <p>Le nouveau compte pourra gérer les vitamines, les aliments et les quiz.</p>
            <form className="vt-profil-form" onSubmit={creer} noValidate>
                <div className="vt-field-row">
                    <div className="vt-field">
                        <label htmlFor="admin-nom">Nom</label>
                        <input id="admin-nom" name="nom" className="vt-input" autoComplete="off"
                            value={champs.nom} onChange={onChange} required />
                    </div>
                    <div className="vt-field">
                        <label htmlFor="admin-email">E-mail</label>
                        <input id="admin-email" name="email" type="email" className="vt-input" autoComplete="off"
                            value={champs.email} onChange={onChange} required />
                    </div>
                </div>
                <div className="vt-field">
                    <label htmlFor="admin-password">Mot de passe</label>
                    <input id="admin-password" name="password" type="password" className="vt-input"
                        autoComplete="new-password" aria-describedby={erreur ? "admin-error" : undefined}
                        value={champs.password} onChange={onChange} required />
                    {erreur && <p id="admin-error" className="vt-field-error" role="alert">{erreur}</p>}
                </div>
                <div className="vt-actions">
                    <button type="submit" className="vt-btn-primary"
                        disabled={envoi || !champs.nom || !champs.email || !champs.password}>
                        {envoi ? "Création…" : "Créer l'administrateur"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default CreerAdmin;
