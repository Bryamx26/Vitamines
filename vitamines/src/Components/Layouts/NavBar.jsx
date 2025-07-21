
import {useNavigate} from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "/src/Components/context/UserContext.jsx"
import { useNotification } from "../context/NotificationContext.jsx";


function NavBar({menu}) {

    const {showNotification} = useNotification()

    const navigate = useNavigate();
    const { user, logout } = useContext(UserContext);

    const handleInfo = () => {
        showNotification("Vous n'êtes plus connecté.", "info");
    };



    return (


        <>
            <nav  className={(menu ? "menu-open" : "menu-close") +" "+"nav"}>
                <a className={"button"}  onClick={()=>(navigate(`/`))}> Home</a>
                {user? <a className={"button"}  onClick={function(){
                        handleInfo();
                        logout()
                        navigate("/")
                    }
                    }> Logout</a>
                    :<a className={"button"} onClick={()=>(navigate(`/Login`))}> Login</a>}
                <a className={"button"}  onClick={()=>(navigate(`/About`))}> About</a>
                <a className={"button"}  onClick={()=>(navigate(`/Contact`))}> Contact</a>


            </nav>
        </>
    )
}

export default NavBar;