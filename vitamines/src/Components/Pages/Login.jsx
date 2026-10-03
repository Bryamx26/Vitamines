import { useContext, useState } from "react";
import Page from "../Layouts/Page.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Scatter } from "../Layouts/Decorations.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { UserContext } from "/src/Components/context/UserContext.jsx"


function Login() {
    const API_URL = useAPI();
    const { login } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const handleSuccess = (nom) => {
        showNotification(`Connexion réussie 
 Bienvenue ${nom}`, "success");
    };

    const handleError = () => {
        showNotification("Connexion échouée", "error");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }) // On envoie dans le body
            });

            const data = await response.json();

            if (response.ok) {
                const nom = data.nom;

                login(data); // On sauvegarde le token etc.
                handleSuccess(nom);
                navigate("/");
            } else {
                handleError();
            }
        } catch (error) {
            console.error("Erreur de requête :", error);
            handleError(error, "error");
            alert("Erreur réseau.");
        }
    };

    return (
        <Page>
            <div className="vt-auth-stage">
                <Scatter />
                <form className="vt-auth" onSubmit={handleSubmit}>
                    <h1 className="vt-display vt-title">Connexion</h1>

                    <div className="vt-field">
                        <label htmlFor="email">E-mail</label>
                        <input
                            className="vt-input"
                            autoComplete="email"
                            type="text"
                            name="email"
                            id="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="vt-field">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            className="vt-input"
                            autoComplete="current-password"
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="vt-btn-primary vt-btn-block">Se connecter</button>

                    <p className="vt-auth-switch">
                        Pas encore de compte ? <Link to="/Register">Créer un compte</Link>
                    </p>
                </form>
            </div>
        </Page>
    );
}

export default Login;
