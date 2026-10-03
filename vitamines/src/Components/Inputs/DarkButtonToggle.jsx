// src/components/DarkButtonToggle.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { MoonIcon, SunIcon } from "../Icons.jsx";


function DarkButtonToggle() {
    const { isDark, setIsDark } = useContext(ThemeContext);

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Thème sombre"
            onClick={() => setIsDark(!isDark)}
            className="vt-toggle"
        >
            <span className="vt-toggle-thumb">
                {isDark ? <MoonIcon size={15} /> : <SunIcon size={15} />}
            </span>
        </button>
    );
}

export default DarkButtonToggle;
