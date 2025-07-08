import {ThemeContext} from "../context/ThemeContext.jsx";
import {useContext} from "react";

function BurgerMenuButton({isOpen, setIsOpen }) {

    const {closeMenu, burgerMenu} = useContext(ThemeContext);
    function handleToggle() {

        setIsOpen(prev => !prev);
    }

    return (
        <img
            className="burgerMenu"
            src={isOpen ? closeMenu  : burgerMenu}
            alt="bouton menu burger"
            onClick={handleToggle}
        />
    );
}

export default BurgerMenuButton;
