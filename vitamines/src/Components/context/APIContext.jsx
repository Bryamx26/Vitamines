import React, {createContext, useContext, useEffect, useState} from "react";

// Crée le contexte
export const APIContext = createContext();

// Fournisseur du contexte
export function APIProvider({ children }) {
    const [publicIp, setPublicIp] = useState("");

    useEffect(() => {
        async function getPublicIP() {
            try {
                const response = await fetch("https://api.ipify.org?format=json");
                const data = await response.json();
                console.log("Adresse IP publique:", data.ip);
                setPublicIp(data.ip);
            } catch (err) {
                console.error("Impossible de récupérer l’IP publique", err.message);
            }
        }

        getPublicIP();
    }, []);

    // Détecte automatiquement l'URL de l'API en fonction du domaine
    const getAPIUrl = () => {
        const host = window.location.hostname;

        if (host === "localhost" || host.startsWith("192.168.")) {
            // Accès local ou réseau local
            return "http://192.168.1.11:3000";
        } else {
            // Accès public (production)
            return `http://${publicIp}:3000`;
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
