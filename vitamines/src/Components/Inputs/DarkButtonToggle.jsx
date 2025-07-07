// src/components/DarkButtonToggle.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";


function DarkButtonToggle() {
    const { isDark, setIsDark } = useContext(ThemeContext);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="buttonDarkMode"
            >


            {isDark ?
                <img
                    style={{
                        position: "relative",
                        left: "25px", // Position finale pour le mode sombre
                        transition: "all 0.2s ease-in-out"
                    }}
                    className="toggle"
                    src="/images/soleil.svg"
                    alt="Soleil"
                />
                :
                <img
                    style={{
                        position: "relative",
                        left: "0px", // Position initiale pour le mode clair
                        transition: "all 0.2s ease-in-out"
                    }}
                    className="toggle"
                    src="/images/lune.png"
                    alt="Lune"
                />
            }

        </button>
    );
}

export default DarkButtonToggle;
