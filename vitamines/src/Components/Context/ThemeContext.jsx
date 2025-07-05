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

    return (
        <ThemeContext.Provider value={{ isDark, setIsDark }}>
            {children}
        </ThemeContext.Provider>
    );
}
