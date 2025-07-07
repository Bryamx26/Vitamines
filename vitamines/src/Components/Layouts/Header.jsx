
import NavBar from "./NavBar.jsx";
import DarkButtonToggle from "../Inputs/DarkButtonToggle.jsx";
import BurgerMenuButton from "../Inputs/BurgerMenuButton.jsx";
import {useState} from "react";

function Header() {

    const [isOpen, setIsOpen] = useState(false);


    return (


        <header className="App-header">
            <BurgerMenuButton  isOpen={isOpen} setIsOpen={setIsOpen} className="burgerMenu" />
            <NavBar menu={isOpen}/>
            <DarkButtonToggle/>

        </header>




    )
}

export default Header ;