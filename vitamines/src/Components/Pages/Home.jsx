import Header from "../Layouts/Header.jsx";
import VitaminsExhibit from "../Vitamines/VitaminsExhibit.jsx";
import {ThemeContext} from "../context/ThemeContext.jsx";
import {useContext} from "react";



function Home(){
    const {isDark} = useContext(ThemeContext);

    return (
        <>
            <Header />
            <main id="MainPage"  style = {{ backgroundColor: isDark ? "black": "#8865e6" , transition: "all 0.5s ease-in" }}>
                {isDark ? (
                    <>
                        <div className="vitamineTitleBacground" ></div>
                        <div className="vitamineTitleBacground2" ></div>

                    </>

                ):null}


                <div className="Title">
                    <p>Vitamines</p>
                </div>
                <VitaminsExhibit/>
            </main>
        </>
    )
}

export default Home