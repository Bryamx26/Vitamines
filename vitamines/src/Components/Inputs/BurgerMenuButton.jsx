

function BurgerMenuButton({isOpen, setIsOpen }) {


    function handleToggle() {
        setIsOpen(prev => !prev);
    }

    return (
        <img
            className="burgerMenu"
            src={isOpen ? "/public/images/close.png"  : "/public/images/burgerMenu.png"}
            alt="bouton menu burger"
            onClick={handleToggle}
        />
    );
}

export default BurgerMenuButton;
