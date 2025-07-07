import { useEffect, useState } from "react";
import {useAPI} from "../context/APIContext.jsx"

function AlimentsGallery({ nom }) {
    const API_URL = useAPI();
    const [aliment, setAliment] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/vitamines/${encodeURIComponent(nom)}/aliments`)
            .then(res => {
                if (!res.ok) throw new Error("Erreur serveur");
                return res.json();
            })
            .then(data => {
                setAliment(data);
            })
            .catch(err => {
                console.error("Erreur lors du chargement :", err);
            });
    }, [nom]);

    console.log(aliment);

    return (
        <div className="aliments-gallery">
            {aliment.map((item, index) => (
                <div className="bubble" key={index}>

                    <img className="AlimentImages"  src={`/public/images/alimentsImages/${item.aliment}.png`}
                           alt={item.aliment}  />
                </div>
            ))}
        </div>
    );
}

export default AlimentsGallery;
