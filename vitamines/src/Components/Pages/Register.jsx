import { useContext, useState } from "react";
import Header from "../Layouts/Header.jsx";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../context/APIContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";

import { useNotification } from "../context/NotificationContext.jsx";
function Register() {
    const API_URL = useAPI();
    const { isDark } = useContext(ThemeContext);
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

    const handleError = () => {
        showNotification("L’enregistrement a échoué", "error");
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

                handleError();
            }
        } catch (err) {
            console.error("Erreur réseau :", err);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div
                className="loginMain"
                style={{
                    backgroundColor: isDark ? "black" : "#3d8c65",
                    transition: "all 0.5s ease-in",
                }}
            >
                {isDark && (
                    <>
                        <div className="vitamineTitleBacground"></div>
                        <div className="vitamineTitleBacground2"></div>
                    </>
                )}

                <form className="loginForm" onSubmit={handleSubmit}>
                    <h2 className="loginTitle">Sign-up</h2>

                    <label className={"text"} htmlFor="nom">Username</label>
                    <input
                        className="input"
                        autoComplete="off"
                        type="text"
                        name="nom"
                        id="nom"
                        required
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                    />


                    <label className={"text"} htmlFor="email">Email</label>
                    <input
                        className="input"
                        autoComplete="off"
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label className={"text"} htmlFor="password">Password</label>
                    <input
                        className="input"
                        autoComplete="off"
                        type="password"
                        name="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label className={"text"} htmlFor="password">Confirm password</label>
                    <input
                        className="input"
                        autoComplete="off"
                        type="password"
                        name="password"
                        id="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />


                    {
                        password !== "" &&
                        confirmPassword !== "" &&
                        confirmPassword === password && (
                            <input
                                type="submit"
                                id="send"
                                value={isLoading ? "Chargement..." : "Sign-up"}
                                disabled={isLoading}
                                style={{
                                    opacity: isLoading ? 0.6 : 1,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                }}
                            />
                        )
                    }

                    <p style={{ marginTop: "1rem" }}>
                        Déjà un compte ?{" "}
                        <a
                            href="/login"
                            style={{ color: isDark ? "#ccc" : "#fff", fontSize: "0.8rem" }}
                        >
                            Connectez-vous ici
                        </a>
                    </p>
                </form>
            </div>
        </>
    );
}

export default Register;
