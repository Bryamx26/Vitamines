import {useContext, useState} from "react";
import Header from "../Layouts/Header.jsx";
import {useNavigate} from "react-router-dom";
import {useAPI} from "../context/APIContext.jsx";

import { UserContext } from "/src/Components/context/UserContext.jsx"

import {ThemeContext} from "../context/ThemeContext.jsx";

function Login() {
    const API_URL = useAPI();
    const {isDark} = useContext(ThemeContext);
    const {login} = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {


        e.preventDefault();

        try {
            const response = await fetch(
                `${API_URL}/vitamines/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            );

            const data = await response.json();

            if (response.ok) {
                login(data)

                navigate("/");
            } else {
                alert(data.error || "Erreur de connexion.");
            }
        } catch (error) {
            console.error("Erreur de requête :", error);
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
                    <h2 className="loginTitle">Login</h2>

                    <p>Mail</p>
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

                    <p>Password</p>
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

                    <input type="submit" id="send" value="Login" />
                </form>
            </div>
        </>
    );
}

export default Login;
