import React, { useEffect, useState } from 'react';
import Loading from "../Pages/Loading.jsx";
import VitamineCard from "./VitamineCard.jsx";
import { useContext } from "react";
import { UserContext } from "/src/Components/context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../context/APIContext.jsx";
import GalleryErrorBanner from '../Layouts/GalleryErrorBanner.jsx';
import { PlusIcon } from "../Icons.jsx";
import { vitamineFamille } from "./vitamineMeta.js";

const FILTRES = [
    { value: "toutes", label: "Toutes", tone: "leaf" },
    { value: "liposoluble", label: "Liposolubles", tone: "butter" },
    { value: "hydrosoluble", label: "Hydrosolubles", tone: "sky" },
];

const VitaminsExhibit = ({ search = "" }) => {
    const API_URL = useAPI();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [vitamines, setVitamines] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [filtre, setFiltre] = useState("toutes");


    useEffect(() => {
        const fetchVitamines = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/vitamines/`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setVitamines(data);
                console.log(data)
            } catch (err) {
                setError(true);
                console.error('Erreur lors du fetch des vitamines:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVitamines();
    }, []);

    const filteredVitamines = vitamines.filter((vitamine) =>
        vitamine.nom.replace("Vitamine ", "").toLowerCase().includes(search.toLowerCase())
        && (filtre === "toutes" || vitamineFamille(vitamine.nom) === filtre)
    );

    return (
        <section className="vt-card vt-gallery-card" aria-labelledby="gallery-title">
            <h2 id="gallery-title" className="vt-display vt-title">Toutes les vitamines</h2>

            <div className="vt-filters" role="group" aria-label="Filtrer par famille">
                {FILTRES.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        className={`vt-badge vt-filter tone-${f.tone}`}
                        aria-pressed={filtre === f.value}
                        onClick={() => setFiltre(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? <Loading /> : error ? <GalleryErrorBanner /> : (
                <div className="vt-gallery">

                    {user && user.role === "admin" ?
                        <button type="button" className="vt-bubble vt-bubble-add" onClick={function () {
                            navigate("/VitamineCreator")
                        }}>
                            <PlusIcon size={40} />
                            <span className="vt-bubble-name">Créer une vitamine</span>
                        </button> : null}

                    {filteredVitamines.map((vitamine) => (
                        <VitamineCard
                            key={vitamine.id}
                            vitamine={vitamine}
                            cliquable={true}
                        />
                    ))}

                    {filteredVitamines.length === 0 && (
                        <p className="vt-empty">Aucune vitamine ne correspond à votre recherche.</p>
                    )}
                </div>
            )}
        </section>
    );
};

export default VitaminsExhibit;
