
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "/src/Components/context/UserContext.jsx"
import { useNotification } from "../context/NotificationContext.jsx";


function NavBar({ menu, onNavigate }) {

    const { showNotification } = useNotification()

    const navigate = useNavigate();
    const { user, logout } = useContext(UserContext);

    const handleInfo = () => {
        showNotification("Vous n'êtes plus connecté.", "info");
    };

    const linkClass = ({ isActive }) => "vt-nav-link" + (isActive ? " is-active" : "");

    return (
        <nav className={"vt-nav " + (menu ? "is-open" : "")} aria-label="Navigation principale">
            <NavLink to="/" end className={linkClass} onClick={onNavigate}>Accueil</NavLink>
            {user ?
                <button type="button" className="vt-nav-link" onClick={function () {
                    handleInfo();
                    logout()
                    navigate("/")
                    onNavigate?.()
                }}>Déconnexion</button>
                : <NavLink to="/Login" className={linkClass} onClick={onNavigate}>Connexion</NavLink>}
            <NavLink to="/About" className={linkClass} onClick={onNavigate}>À propos</NavLink>
            <NavLink to="/Contact" className={linkClass} onClick={onNavigate}>Contact</NavLink>
        </nav>
    )
}

export default NavBar;
