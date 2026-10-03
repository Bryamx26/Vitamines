import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { PlusIcon } from "../Icons.jsx";

import AssociationModal from "../Aliments/AssociationModal.jsx";

export default function VitamineEditor() {
    const API_URL = useAPI();
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [modalOpen, setModalOpen] = useState(false);

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
                    nom_scientifique: vitObj?.nom_scientifique || "",
                    gramage : vitObj?.gramage || 0,
                });

                // Effets
                const effRes = await fetch(`${API_URL}/vitamines/${id}/effects`);

                if (effRes.ok) {
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
                } else if (effRes.status === 404) {
                    // Aucun effet → liste vide
                    setEffets([]);
                } else {
                    throw new Error("Erreur récupération effets");
                }

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
    const handleGramageChange = ( e ) =>{
        setVitamine((prev)=>({
            ...prev,
                gramage : e.target.value
        }))
    }

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
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">Administration</p>
                <h1 className="vt-display vt-hero-title">Éditer la vitamine</h1>
            </section>

            <form className="vt-admin-form" onSubmit={handleSubmit}>
                <div className="vt-grid-2">
                    <section className="vt-panel tone-leaf">
                        <h2 className="vt-display vt-panel-title">Identité</h2>
                        <div className="vt-field">
                            <label htmlFor="nom">Nom</label>
                            <input
                                id="nom"
                                name="nom"
                                value={vitamine.nom}
                                onChange={handleVitamineChange}
                                required
                                className="vt-input"
                            />
                        </div>
                        <div className="vt-field">
                            <label htmlFor="nom_scientifique">Nom scientifique</label>
                            <input
                                id="nom_scientifique"
                                name="nom_scientifique"
                                value={vitamine.nom_scientifique || ""}
                                onChange={handleVitamineChange}
                                required
                                className="vt-input"
                            />
                        </div>
                        <div className="vt-field-row">
                            <div className="vt-field">
                                <label htmlFor="gramage">Apport <span className="vt-unit">(mg / jour)</span></label>
                                <input className="vt-input" id="gramage" type="number" onChange={handleGramageChange} value={vitamine.gramage ?? ""} />
                            </div>
                            <div className="vt-field">
                                <label htmlFor="colorInput">Couleur</label>
                                <input
                                    id="colorInput"
                                    className="vt-color"
                                    type="color"
                                    name="couleur"
                                    value={vitamine.couleur}
                                    onChange={handleVitamineChange}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="vt-panel tone-sky">
                        <h2 className="vt-display vt-panel-title">Description</h2>
                        <div className="vt-field">
                            <label htmlFor="description">Texte de la fiche</label>
                            <textarea
                                id="description"
                                name="description"
                                value={vitamine.description}
                                onChange={handleVitamineChange}
                                required
                                className="vt-input vt-textarea"
                            />
                        </div>
                    </section>
                </div>

                <section className="vt-panel tone-butter">
                    <h2 className="vt-display vt-panel-title">Aliments associés</h2>
                    <button
                        type="button"
                        className="vt-btn-ghost"
                        onClick={() => setModalOpen(true)}
                    >
                        Gérer les associations
                    </button>

                    <AssociationModal
                        open={modalOpen}
                        setOpen={setModalOpen}
                        vitamineId={id}
                        nom={vitamine.nom}
                    />
                </section>

                <section className="vt-panel tone-lilac">
                    <h2 className="vt-display vt-panel-title">Fonctions</h2>
                    {fonctions.map((f, i) => (
                        <div key={i} className="vt-repeat-row">
                            <input
                                placeholder="Fonction"
                                aria-label={`Nom de la fonction ${i + 1}`}
                                className="vt-input"
                                value={f.nom || ""}
                                onChange={(e) => handleFonctionChange(i, "nom", e.target.value)}
                                required
                            />
                            <input
                                placeholder="Description"
                                aria-label={`Description de la fonction ${i + 1}`}
                                className="vt-input"
                                value={f.description || ""}
                                onChange={(e) =>
                                    handleFonctionChange(i, "description", e.target.value)
                                }
                                required
                            />
                            <button
                                className="vt-btn-ghost vt-btn-danger"
                                type="button"
                                onClick={() => removeFonction(i)}
                                aria-label={`Supprimer fonction ${i + 1}`}
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                    <button className="vt-btn-ghost" type="button" onClick={addFonction}>
                        <PlusIcon size={18} /> Ajouter une fonction
                    </button>
                </section>

                <section className="vt-panel tone-peach">
                    <h2 className="vt-display vt-panel-title">Effets</h2>
                    {effets.map((effet, index) => (
                        <div key={index} className="vt-repeat-row">
                            <select
                                className="vt-input"
                                aria-label={`Type de l'effet ${index + 1}`}
                                value={effet.type || "avantage"}
                                onChange={(e) => handleEffetChange(index, "type", e.target.value)}
                            >
                                <option value="avantage">Avantage</option>
                                <option value="carence">Carence</option>
                                <option value="excès">Excès</option>
                            </select>
                            <input
                                className="vt-input"
                                type="text"
                                placeholder="Description"
                                aria-label={`Description de l'effet ${index + 1}`}
                                value={effet.description || ""}
                                onChange={(e) =>
                                    handleEffetChange(index, "description", e.target.value)
                                }
                                required
                            />
                            <button
                                className="vt-btn-ghost vt-btn-danger"
                                type="button"
                                onClick={() => removeEffet(index)}
                                aria-label={`Supprimer effet ${index + 1}`}
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                    <button className="vt-btn-ghost" type="button" onClick={addEffet}>
                        <PlusIcon size={18} /> Ajouter un effet
                    </button>
                </section>

                <div className="vt-actions">
                    <button className="vt-btn-primary" type="submit">
                        Enregistrer
                    </button>
                    <button className="vt-btn-ghost vt-btn-danger" type="button" onClick={handleDelete}>
                        Supprimer la vitamine
                    </button>
                </div>
            </form>
        </Page>
    );
}
