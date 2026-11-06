
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "/src/Components/context/UserContext.jsx"


function NavBar({ menu, onNavigate }) {

    const { user } = useContext(UserContext);

    const linkClass = ({ isActive }) => "vt-nav-link" + (isActive ? " is-active" : "");

    return (
        <nav className={"vt-nav " + (menu ? "is-open" : "")} aria-label="Navigation principale">
            <NavLink to="/" end className={linkClass} onClick={onNavigate}>Accueil</NavLink>
            <NavLink to="/quiz" className={linkClass} onClick={onNavigate}>Quiz</NavLink>
            {user
                ? <NavLink to="/profil" className={linkClass} onClick={onNavigate}>Mon espace</NavLink>
                : <NavLink to="/Login" className={linkClass} onClick={onNavigate}>Connexion</NavLink>}
            <NavLink to="/About" className={linkClass} onClick={onNavigate}>À propos</NavLink>
            <NavLink to="/Contact" className={linkClass} onClick={onNavigate}>Contact</NavLink>
        </nav>
    )
}

export default NavBar;
