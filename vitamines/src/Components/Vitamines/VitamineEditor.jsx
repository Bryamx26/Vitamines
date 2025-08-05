import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Layouts/Header.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { useAPI } from "../context/APIContext.jsx";

export default function VitamineEditor() {
    const API_URL = useAPI();
    const { isDark } = useContext(ThemeContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [vitamine, setVitamine] = useState({
        nom: "",
        description: "",
        couleur: "#5e80c8",
        nom_scientifique: ""
    });

    const [effets, setEffets] = useState([]);
    const [fonctions, setFonctions] = useState([]);

    // Refs pour garder toujours la dernière valeur au submit (évite closure stale)
    const effetsRef = useRef(effets);
    const fonctionsRef = useRef(fonctions);

    useEffect(() => {
        effetsRef.current = effets;
    }, [effets]);

    useEffect(() => {
        fonctionsRef.current = fonctions;
    }, [fonctions]);

    // Fetch données initiales
    useEffect(() => {
        async function fetchData() {
            try {
                // Vitamine
                const vitRes = await fetch(`${API_URL}/vitamines/${id}`);
                if (!vitRes.ok) throw new Error("Erreur récupération vitamine");
                const vitData = await vitRes.json();
                const vitObj = Array.isArray(vitData) ? vitData[0] : vitData;

                setVitamine({
                    nom: vitObj?.nom || "",
                    description: vitObj?.description || "",
                    couleur: vitObj?.couleur || "#5e80c8",
                    nom_scientifique: vitObj?.nom_scientifique || ""
                });

                // Effets
                const effRes = await fetch(`${API_URL}/vitamines/${id}/effects`);
                if (!effRes.ok) throw new Error("Erreur récupération effets");
                const effData = await effRes.json();

                setEffets(
                    Array.isArray(effData)
                        ? effData.map((e) => ({
                            id: e.id,
                            type: e.type_effet || "avantage",
                            description: e.description || ""
                        }))
                        : []
                );

                // Fonctions
                const fnRes = await fetch(`${API_URL}/vitamines/${id}/fonctions`);
                if (!fnRes.ok) throw new Error("Erreur récupération fonctions");
                const fnData = await fnRes.json();

                setFonctions(
                    Array.isArray(fnData)
                        ? fnData.map((f) => ({
                            id: f.id,
                            nom: f.nom || "",
                            description: f.description || ""
                        }))
                        : []
                );
            } catch (err) {
                console.error(err);
                alert("Impossible de charger la vitamine");
            }
        }
        fetchData();
    }, [API_URL, id]);

    // Handlers simples pour inputs
    const handleVitamineChange = ({ target: { name, value } }) => {
        setVitamine((v) => ({ ...v, [name]: value }));
    };

    const handleEffetChange = (index, field, value) => {
        setEffets((prev) =>
            prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
        );
    };

    const handleFonctionChange = (index, field, value) => {
        setFonctions((prev) =>
            prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
        );
    };

    const addEffet = () => setEffets((prev) => [...prev, { type: "avantage", description: "" }]);
    const removeEffet = (index) => setEffets((prev) => prev.filter((_, i) => i !== index));

    const addFonction = () => setFonctions((prev) => [...prev, { nom: "", description: "" }]);
    const removeFonction = (index) => setFonctions((prev) => prev.filter((_, i) => i !== index));

    // Submit avec valeurs actuelles via refs
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...vitamine,
            effets: effetsRef.current,
            fonctions: fonctionsRef.current
        };
        console.log("Payload envoyé:", payload);

        try {
            const res = await fetch(`${API_URL}/vitamines/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error();
            alert("Vitamine mise à jour !");
            navigate(-1);
        } catch {
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Confirmer suppression ?")) return;
        try {
            const res = await fetch(`${API_URL}/vitamines/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            alert("Supprimée");
            navigate("/");
        } catch {
            alert("Erreur suppression");
        }
    };
    return (
        <>
            <Header />
            <form
                onSubmit={handleSubmit}
                style={{ backgroundColor: isDark ? "black" : vitamine.couleur }}
                className="vitamineForm"
            >
                {isDark && (
                    <>
                        <div
                            className="vitamineTitleBacground2"
                            style={{
                                background: `radial-gradient(
                    ${vitamine.couleur} 0%,
                    rgba(5, 12, 241, 0.41) 30%,
                    rgba(2, 2, 1, 0.02) 70%
                )`
                            }}
                        />
                        <div
                            className="vitamineTitleBacground"
                            style={{
                                background: `radial-gradient(
                    ${vitamine.couleur} 0%,
                    rgba(5, 12, 241, 0.41) 30%,
                    rgba(2, 2, 1, 0.02) 70%
                )`
                            }}
                        />
                    </>
                )}

                <div className="vitamineTitle">
                    <p>Éditer Vitamine </p>
                </div>

                <div className="NomInput">
                    <input
                        name="nom"
                        value={vitamine.nom}
                        onChange={handleVitamineChange}
                        required
                        placeholder="Nom"
                        className="textInput"
                    />
                </div>

                <div className="vitamineContainer">
                    <div className="vitamineCardContainer1">
                        <div className="vitamineCard vitamineDescription">
                            <p>Description</p>
                            <textarea
                                name="description"
                                value={vitamine.description}
                                onChange={handleVitamineChange}
                                required
                                style={{ whiteSpace: "pre-wrap" }}
                                className="vitamineDescriptionInput"
                            />
                        </div>

                        <div className="vitamineAlimentGContainer">
                            <div className="vitamineQuantity">
                                <div className="vitamineColorInput">
                                    <span className="input">Choisir une couleur </span>
                                    <label className="color-picker">
                                        <div
                                            className="preview"
                                            style={{ backgroundColor: vitamine.couleur }}
                                        />
                                        <input
                                            id="colorInput"
                                            className="hidden-color"
                                            type="color"
                                            name="couleur"
                                            value={vitamine.couleur}
                                            onChange={handleVitamineChange}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="vitamineAliment"></div>
                        </div>
                    </div>

                    <div className="vitamineCardContainer2">
                        <div className="vitamineCard fonctions">
                            <h3>Fonctions</h3>
                            <button className="buttons" type="button" onClick={addFonction}>
                                + Fonction
                            </button>
                            {fonctions.map((f, i) => (
                                <div
                                    key={i}
                                    className="fonctionBloc"
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                        justifyContent: "space-evenly"
                                    }}
                                >
                                    <input
                                        placeholder={"Fonction"}
                                        className="textInput"
                                        value={f.nom || ""}
                                        onChange={(e) => handleFonctionChange(i, "nom", e.target.value)}
                                        required
                                    />
                                    <input
                                        placeholder={"Description"}
                                        className="textInput"
                                        value={f.description || ""}
                                        onChange={(e) =>
                                            handleFonctionChange(i, "description", e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        className="buttonsSupprimer"
                                        type="button"
                                        onClick={() => removeFonction(i)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="vitamineInfosContainer">
                            <div className="effects">
                                <h3>Effets</h3>
                                <button className="buttons" type="button" onClick={addEffet}>
                                    + Ajouter effet
                                </button>
                                {effets.map((effet, index) => (
                                    <div
                                        key={index}
                                        style={{ display: "flex", gap: "10px", alignItems: "center" }}
                                    >
                                        <select
                                            className="textInput"
                                            value={effet.type || "avantage"}
                                            onChange={(e) => handleEffetChange(index, "type", e.target.value)}
                                        >
                                            <option value="avantage">Avantage</option>
                                            <option value="carence">Carence</option>
                                            <option value="excès">Excès</option>
                                        </select>
                                        <input
                                            className="textInput"
                                            type="text"
                                            placeholder="Description"
                                            value={effet.description || ""}
                                            onChange={(e) =>
                                                handleEffetChange(index, "description", e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            className="buttonsSupprimer"
                                            type="button"
                                            onClick={() => removeEffet(index)}
                                            aria-label={`Supprimer effet ${index + 1}`}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="calculateur">
                                <div className="NomInput">
                                    <input
                                        name="nom_scientifique"
                                        value={vitamine.nom_scientifique || ""}
                                        onChange={handleVitamineChange}
                                        required
                                        placeholder="Nom scientifique"
                                        className="textInput"
                                    />
                                </div>

                                <div>
                                    <button className="buttons" type="submit">
                                        Enregistrer
                                    </button>
                                    <button className="buttons" type="button" onClick={handleDelete}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
