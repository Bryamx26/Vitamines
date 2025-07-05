// src/components/DarkButtonToggle.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function DarkButtonToggle() {
    const { isDark, setIsDark } = useContext(ThemeContext);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="input"
            aria-label="Changer le thème"

        >
            {isDark ? "☀️ Mode clair" : "🌙 Mode sombre"}

        </button>
    );
}

export default DarkButtonToggle;
