// src/context/APIContext.jsx
import React, { createContext, useContext } from "react";

// Crée le contexte
export const APIContext = createContext();

// Détecte automatiquement l'URL de l'API en fonction du domaine
const getAPIUrl = () => {
    const host = window.location.hostname;

    if (host === "localhost" || host.startsWith("192.168.")) {
        // Accès local ou réseau local
        return "http://192.168.1.11:3000";
    } else {
        // Accès public (production)
        return "http://109.130.147.120:3000"; // Remplace ici par ton IP publique
    }
};

// Fournisseur du contexte
export function APIProvider({ children }) {
    const apiUrl = getAPIUrl();

    return (
        <APIContext.Provider value={apiUrl}>
            {children}
        </APIContext.Provider>
    );
}

// Hook pratique pour utiliser le contexte
export function useAPI() {
    return useContext(APIContext);
}
