import { useEffect, useState } from "react";
import { useAPI } from "../context/APIContext.jsx"

function AllAlimentFrame() {
    const API_URL = useAPI();
    const [aliment, setAliment] = useState([]);



    useEffect(() => {
        const fetchAliments = async () => {
            try {
                const res = await fetch(`${API_URL}/aliments/`, {
                    method: 'GET',
                });

                if (!res.ok) {
                    throw new Error("Erreur serveur");
                }

                const data = await res.json();
                setAliment(data);

            } catch (err) {
                console.error("Erreur lors du chargement :", err);
            }
        };

        fetchAliments();
    }, []);


    return (
        <ul className="vt-foods">
            {Array.isArray(aliment) && aliment.map((item, index) => (
                <li className="vt-food" key={index}>
                    <span className="vt-food-pill">
                        <img src={`/images/alimentsImages/${item.path}`} alt="" />
                    </span>
                    <span className="vt-food-name">{item.nom}</span>
                </li>
            ))}
        </ul>
    );
}

export default AllAlimentFrame;
