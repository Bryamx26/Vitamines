import {useContext, useState} from "react";
import Header from "../Layouts/Header.jsx";
import {useNavigate} from "react-router-dom";
import {useAPI} from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { UserContext } from "/src/Components/context/UserContext.jsx"

import {ThemeContext} from "../context/ThemeContext.jsx";


function Login() {
    const API_URL = useAPI();
    const {isDark} = useContext(ThemeContext);
    const {login} = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const handleSuccess = (nom) => {
        showNotification(`Connexion réussie 
 Bienvenue ${nom}`, "success");
    };

    const handleError = () => {
        showNotification( "Connexion échouée" , "error");
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
                console.log(data);
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
        <>
            <Header />
            <div className="loginMain" style = {{ backgroundColor: isDark ? "black": "#8865E6" , transition: "all 0.5s ease-in" }}>

                {isDark ? (
                    <>
                        <div className="vitamineTitleBacground"></div>
                        <div className="vitamineTitleBacground2"></div>

                    </>

                ):null}

                <form className="loginForm" onSubmit={handleSubmit}>
                    <h2 className="loginTitle">Sign-in</h2>

                    <label className={"text"} htmlFor={"email"} >Email </label>
                    <input
                        className="input"
                        autoComplete="off"
                        type="text"
                        name="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label className={"text"} htmlFor={"password"}> Password</label>
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

                    <input type="submit" id="send" value="Done" />

                    <p style={{ marginTop: "11px" }}>
                        Pas encore de compte ?{" "}
                        <a href="/register" style={{ color: isDark ? "#ccc" : "#fff" , fontSize: "0.8rem" }}>
                            Créez-en un ici
                        </a>
                    </p>

                </form>
            </div>
        </>
    );
}

export default Login;
