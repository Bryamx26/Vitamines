

function BurgerMenuButton({isOpen, setIsOpen }) {


    function handleToggle() {
        setIsOpen(prev => !prev);
    }

    return (
        <img
            className="burgerMenu"
            src={isOpen ? "/images/close.png"  : "/images/burgerMenu.png"}
            alt="bouton menu burger"
            onClick={handleToggle}
        />
    );
}

export default BurgerMenuButton;
