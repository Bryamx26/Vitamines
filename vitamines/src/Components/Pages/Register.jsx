import { useContext, useState } from "react";
import Page from "../Layouts/Page.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Scatter } from "../Layouts/Decorations.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

import { useNotification } from "../context/NotificationContext.jsx";
function Register() {
    const API_URL = useAPI();
    const { login } = useContext(UserContext);
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSuccess = (nom) => {
        showNotification(`Enregistrement réussi \n bienvenue ${nom}`, "success");
    };

    const handleError = (message) => {
        showNotification(message || "L’enregistrement a échoué", "error");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);


        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nom, email, password }),
            });

            const data = await response.json();

            if (response.ok) {

                handleSuccess(nom);
                login(data);
                navigate("/");
            } else {

                handleError(data.message || data.error);
            }
        } catch (err) {
            console.error("Erreur réseau :", err);

        } finally {
            setIsLoading(false);
        }
    };

    // Même règle que l'API : 8 caractères minimum, au moins une lettre et un chiffre
    const passwordStrong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
    const passwordsMatch = password !== "" && confirmPassword !== "" && confirmPassword === password;
    const passwordsMismatch = password !== "" && confirmPassword !== "" && confirmPassword !== password;

    return (
        <Page>
            <div className="vt-auth-stage">
                <Scatter />
                <form className="vt-auth vt-auth-wide" onSubmit={handleSubmit}>
                    <h1 className="vt-display vt-title">Inscription</h1>

                    <div className="vt-field-row">
                        <div className="vt-field">
                            <label htmlFor="nom">Nom d'utilisateur</label>
                            <input
                                className="vt-input"
                                autoComplete="username"
                                type="text"
                                name="nom"
                                id="nom"
                                required
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                            />
                        </div>

                        <div className="vt-field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                className="vt-input"
                                autoComplete="email"
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="vt-field-row">
                        <div className="vt-field">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                className="vt-input"
                                autoComplete="new-password"
                                type="password"
                                name="password"
                                id="password"
                                required
                                aria-describedby="password-hint"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="vt-field">
                            <label htmlFor="password-check">Confirmer le mot de passe</label>
                            <input
                                className="vt-input"
                                autoComplete="new-password"
                                type="password"
                                name="password"
                                id="password-check"
                                required
                                aria-invalid={passwordsMismatch}
                                aria-describedby={passwordsMismatch ? "password-error" : undefined}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <p id="password-hint" className={password && !passwordStrong ? "vt-field-error" : "vt-auth-switch"}>
                        Au moins 8 caractères, dont une lettre et un chiffre.
                    </p>

                    {passwordsMismatch && (
                        <p id="password-error" className="vt-field-error" role="alert">
                            Les mots de passe ne correspondent pas.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="vt-btn-primary vt-btn-block"
                        disabled={!passwordsMatch || !passwordStrong || isLoading}
                    >
                        {isLoading ? "Chargement…" : "Créer mon compte"}
                    </button>

                    <p className="vt-auth-switch">
                        Déjà un compte ? <Link to="/Login">Se connecter</Link>
                    </p>
                </form>
            </div>
        </Page>
    );
}

export default Register;
