import React, { createContext, useContext, } from "react";

// Crée le contexte
export const APIContext = createContext();

// Fournisseur du contexte
export function APIProvider({ children }) {




    // Détecte automatiquement l'URL de l'API en fonction du domaine
    const getAPIUrl = () => {
        const host = window.location.hostname;

        if (host === "localhost" || host.startsWith("192.168.")) {
            // Accès local ou réseau local : l'API tourne sur la même machine que le front
            return `http://${host}:3000/api`;
        } else {
            // Accès public (production) : domaine défini au build via VITE_API_URL
            return `${import.meta.env.VITE_API_URL}/api`;
        }

    };

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
