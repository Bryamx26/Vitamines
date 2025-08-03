// src/contexts/UserContext.jsx
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Charger l'utilisateur depuis localStorage au démarrage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(storedUser); // ✅ Corrigé ici
        }
    }, []);

    // Connexion : stocker user dans localStorage
    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        localStorage.setItem('token', userData.token);

    };

    // Déconnexion : supprimer user du localStorage
    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
