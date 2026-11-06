import { CloseIcon, MenuIcon } from "../Icons.jsx";

function BurgerMenuButton({ isOpen, setIsOpen }) {

    function handleToggle() {
        setIsOpen(prev => !prev);
    }

    return (
        <button
            type="button"
            className="vt-burger"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            onClick={handleToggle}
        >
            {isOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
    );
}

export default BurgerMenuButton;
