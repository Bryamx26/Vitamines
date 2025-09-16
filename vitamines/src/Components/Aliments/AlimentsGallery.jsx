import { useEffect, useState } from "react";
import { useAPI } from "../context/APIContext.jsx"

function AlimentsGallery({ nom }) {
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
    console.log(aliment);

    return (
        <div className="aliments-gallery">
            {Array.isArray(aliment) && aliment.map((item, index) => (
                <div className="bubble" key={ index}>


                    <img className="AlimentImages" src={`/images/alimentsImages/${item.aliment}`}
                        alt={item.aliment} />
                </div>
            ))}
        </div>
    );
}

export default AlimentsGallery;
