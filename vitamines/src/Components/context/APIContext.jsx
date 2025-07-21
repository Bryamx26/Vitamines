import React, {createContext, useContext,} from "react";

// Crée le contexte
export const APIContext = createContext();

// Fournisseur du contexte
export function APIProvider({ children }) {




    // Détecte automatiquement l'URL de l'API en fonction du domaine
    const getAPIUrl = () => {
        const host = window.location.hostname;

        if (host === "localhost" || host.startsWith("192.168.")) {
            // Accès local ou réseau local
            return "http://192.168.1.11:3000";
        } else {
            // Accès public (production)
            return `https://api.bryamsilva.online`;
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
