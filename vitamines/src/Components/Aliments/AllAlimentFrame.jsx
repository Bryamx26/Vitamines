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
        <div className="aliments-frame">
            {Array.isArray(aliment) && aliment.map((item, index) => (

                <div className="bubble" key={ index}>


                    <img className="AlimentImages"  src={`/images/alimentsImages/${item.path} `}
                         alt={item.nom} title={item.gramage} />
                </div>
            ))}
        </div>
    );
}

export default AllAlimentFrame;
