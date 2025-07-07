
import {useNavigate} from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "/src/Components/Context/UserContext.jsx"



function NavBar({menu}) {


    const navigate = useNavigate();
    const { user, logout } = useContext(UserContext);


    return (


        <>
            <nav  className={(menu ? "menu-open" : "menu-close") +" "+"nav"}>
                <a className={"button"}  onClick={()=>(navigate(`/`))}> Home</a>
                {user? <a className={"button"}  onClick={function(){
                        logout()
                        navigate("/")
                    }
                    }> Logout</a>
                    :<a className={"button"} onClick={()=>(navigate(`/Login`))}> Login</a>}
                <a className={"button"}  onClick={()=>(navigate(`/`))}> About</a>
                <a className={"button"}  onClick={()=>(navigate(`/`))}> Contact</a>


            </nav>
        </>
    )
}

export default NavBar;