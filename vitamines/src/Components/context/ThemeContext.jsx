// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect } from "react";

// Création du contexte
export const ThemeContext = createContext();

// Fournisseur du contexte
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("theme") === "dark"; // Récupère le thème stocké
    });

    // Applique la classe "dark" ou "light" au <body> dès que le thème change
    useEffect(() => {
        document.body.className = isDark ? "dark" : "light";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);


    const [closeMenu, setCloseMenu] = useState('/images/close.png');
    const [burgerMenu, setBurgerMenu] = useState('/images/burgerMenu.png');

    useEffect(() => {
        if (isDark) {
            setCloseMenu('/images/closeLight.svg');
            setBurgerMenu('/images/burgerMenuLight.svg');

        } else {
            setCloseMenu('/images/closeDark.svg');
            setBurgerMenu('/images/burgerMenuDark.svg');
        }
    }, [isDark]);



    return (
        <ThemeContext.Provider value={{ isDark, setIsDark, closeMenu, burgerMenu }}>
            {children}
        </ThemeContext.Provider>
    );
}
