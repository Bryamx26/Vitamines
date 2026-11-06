// src/context/ThemeContext.jsx
import React, { createContext, useState, useLayoutEffect } from "react";

// Création du contexte
export const ThemeContext = createContext();

// Thème initial : choix mémorisé, sinon préférence du système
function getInitialTheme() {
    try {
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") return stored === "dark";
    } catch {
        // stockage indisponible (navigation privée…)
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

// Fournisseur du contexte
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(getInitialTheme);

    // Applique data-theme sur <html> avant l'affichage pour éviter un flash
    useLayoutEffect(() => {
        const theme = isDark ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem("theme", theme);
        } catch {
            // stockage indisponible : le thème reste valable pour la session
        }
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, setIsDark }}>
            {children}
        </ThemeContext.Provider>
    );
}
