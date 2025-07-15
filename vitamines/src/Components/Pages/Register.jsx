import { useContext, useState } from "react";
import Header from "../Layouts/Header.jsx";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../context/APIContext.jsx";
import { UserContext } from "/src/Components/context/UserContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";

function Register() {
    const API_URL = useAPI();
    const { isDark } = useContext(ThemeContext);
    const { login } = useContext(UserContext);
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/vitamines/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nom, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data);
                navigate("/");
            } else {
                alert(data.error || "Erreur lors de l'inscription.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            alert("Erreur réseau.");
        }
    };

    return (
        <>
            <Header />
            <div
                className="loginMain"
                style={{
                    backgroundColor: isDark ? "black" : "#8865E6",
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
                    <h2 className="loginTitle">Register</h2>

                    <label htmlFor="username">Username</label>
                    <input
                        className="input"
                        autoComplete="off"
                        type="text"
                        name="username"
                        id="username"
                        required
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                    />

                    <label htmlFor="email">Email</label>
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

                    <label htmlFor="password">Password</label>
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

                    <input type="submit" id="send" value="Register" />
                    <p style={{ marginTop: "1rem" }}>
                        Déjà un compte ?{" "}
                        <a href="/login" style={{ color: isDark ? "#ccc" : "#fff", fontSize: "0.8rem" }}>
                            Connectez-vous ici
                        </a>
                    </p>
                </form>
            </div>
        </>
    );
}

export default Register;
