import { Link } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import DarkButtonToggle from "../Inputs/DarkButtonToggle.jsx";
import BurgerMenuButton from "../Inputs/BurgerMenuButton.jsx";
import { useState } from "react";

function Header() {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="vt-header">
            <Link to="/" className="vt-logo vt-on-tone">
                <span className="vt-logo-mark" aria-hidden="true">
                    <i></i><i></i><i></i><i></i>
                </span>
                <span className="vt-logo-text">Vitamines</span>
            </Link>
            <NavBar menu={isOpen} onNavigate={() => setIsOpen(false)} />
            <div className="vt-header-actions">
                <DarkButtonToggle />
                <BurgerMenuButton isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>
        </header>
    )
}

export default Header;
