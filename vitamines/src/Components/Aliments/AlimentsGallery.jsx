import { useEffect, useState } from "react";
import { useAPI } from "../context/APIContext.jsx"

function AlimentsGallery({ nom, onCount }) {
    const API_URL = useAPI();
    const [aliment, setAliment] = useState([]);



    useEffect(() => {
        const fetchAliment = async () => {
            try {
                const res = await fetch(`${API_URL}/aliments/${encodeURIComponent(nom)}`, {
                    method: "GET",
                });

                if (res.ok) {
                    const data = await res.json();
                    setAliment(data);
                } else if (res.status === 404) {
                    // Aucun aliment trouvé → état vide
                    setAliment(null); // ou {} / [] selon ta logique
                } else {
                    throw new Error("Erreur serveur");
                }
            } catch (err) {
                console.error("Erreur lors du chargement :", err);
            }
        };

        if (nom) {
            fetchAliment();
        }
    }, [API_URL, nom]);

    // Prévient le parent du nombre d'aliments (pour masquer un panneau vide)
    useEffect(() => {
        onCount?.(Array.isArray(aliment) ? aliment.length : 0);
    }, [aliment, onCount]);

    return (
        <ul className="vt-foods">
            {Array.isArray(aliment) && aliment.map((item, index) => (
                <li className="vt-food" key={index}>
                    <span className="vt-food-pill">
                        <img src={`/images/alimentsImages/${item.aliment}`} alt="" />
                    </span>
                    <span className="vt-food-name">{item.nom || item.aliment}</span>
                </li>
            ))}
        </ul>
    );
}

export default AlimentsGallery;
