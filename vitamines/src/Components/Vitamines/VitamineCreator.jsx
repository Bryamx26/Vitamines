import React, { useState } from "react";
import Page from "../Layouts/Page.jsx";
import { useAPI } from "../context/APIContext.jsx";
import AddAlimentBubble from "../Aliments/AddAlimentBubble.jsx";
import { PlusIcon } from "../Icons.jsx";

function VitamineCreator() {
    const API_URL = useAPI()
    const [vitamine, setVitamine] = useState({
        nom: "",
        description: "",
        nom_scientifique: "",
        couleur: "#5e80c8",
        gramage : 0,
    });

    const [effets, setEffets] = useState([
        { type: "avantage", description: "" },
    ]);

    const [fonctions, setFonctions] = useState([
        { nom: "", description: "" },
    ]);

    const handleVitamineChange = (e) => {
        const { name, value } = e.target;

        setVitamine({ ...vitamine, [name]: value });


    };

    const handleEffetChange = (index, field, value) => {
        const newEffets = [...effets];
        newEffets[index][field] = value;
        setEffets(newEffets);
    };

    const handleFonctionChange = (index, field, value) => {
        const newFonctions = [...fonctions];
        newFonctions[index][field] = value;
        setFonctions(newFonctions);
    };

    const handleGramageChange = (e) => {
        setVitamine((prev) => ({
            ...prev,                  // garde toutes les anciennes clés
            gramage: e.target.value,  // met à jour uniquement gramage
        }));
    };

    const addEffet = () => setEffets([...effets, { type: "avantage", description: "" }]);
    const removeEffet = (index) => {
        const newEffets = effets.filter((_, i) => i !== index);
        setEffets(newEffets);
    };

    const addFonction = () => setFonctions([...fonctions, { nom: "", description: "" }]);
    const removeFonction = (index) => {
        const newFonctions = fonctions.filter((_, i) => i !== index);
        setFonctions(newFonctions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            ...vitamine,
            effets,
            fonctions,
        };

        try {
            const response = await fetch(`${API_URL}/vitamines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("Vitamine créée avec succès !");
                setVitamine({ nom: "", description: "", couleur: "#5e80c8", nom_scientifique: "" });
                setEffets([{ type: "avantage", description: "" }]);
                setFonctions([{ nom: "", description: "" }]);
            } else {
                const error = await response.json();
                alert("Erreur : " + error.message);
            }
        } catch (err) {
            console.error("Erreur réseau :", err);
            alert("Erreur réseau");
        }
    };


    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">Administration</p>
                <h1 className="vt-display vt-hero-title">Nouvelle vitamine</h1>
            </section>

            <form className="vt-admin-form" onSubmit={handleSubmit}>
                <div className="vt-grid-2">
                    <section className="vt-panel tone-leaf">
                        <h2 className="vt-display vt-panel-title">Identité</h2>
                        <div className="vt-field">
                            <label htmlFor="nom">Nom</label>
                            <input
                                id="nom"
                                type="text"
                                className="vt-input"
                                name="nom"
                                autoComplete="off"
                                placeholder="Vitamine A"
                                value={vitamine.nom}
                                onChange={handleVitamineChange}
                                required
                            />
                        </div>
                        <div className="vt-field">
                            <label htmlFor="nom_scientifique">Nom scientifique</label>
                            <input
                                id="nom_scientifique"
                                type="text"
                                className="vt-input"
                                name="nom_scientifique"
                                autoComplete="off"
                                placeholder="Rétinol"
                                value={vitamine.nom_scientifique}
                                onChange={handleVitamineChange}
                                required
                            />
                        </div>
                        <div className="vt-field-row">
                            <div className="vt-field">
                                <label htmlFor="gramage">Apport <span className="vt-unit">(mg / jour)</span></label>
                                <input className="vt-input" id="gramage" type="number" onChange={handleGramageChange} value={vitamine.gramage} />
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
                                className="vt-input vt-textarea"
                                name="description"
                                value={vitamine.description}
                                onChange={handleVitamineChange}
                                required
                            />
                        </div>
                    </section>
                </div>

                <section className="vt-panel tone-butter">
                    <h2 className="vt-display vt-panel-title">Aliments</h2>
                    <AddAlimentBubble/>
                </section>

                <section className="vt-panel tone-lilac">
                    <h2 className="vt-display vt-panel-title">Fonctions</h2>
                    {fonctions.map((f, index) => (
                        <div key={index} className="vt-repeat-row">
                            <input
                                className="vt-input"
                                type="text"
                                placeholder="Nom"
                                aria-label={`Nom de la fonction ${index + 1}`}
                                value={f.nom}
                                onChange={(e) => handleFonctionChange(index, "nom", e.target.value)}
                                required
                            />
                            <input
                                className="vt-input"
                                type="text"
                                placeholder="Description"
                                aria-label={`Description de la fonction ${index + 1}`}
                                value={f.description}
                                onChange={(e) => handleFonctionChange(index, "description", e.target.value)}
                                required
                            />
                            <button
                                className="vt-btn-ghost vt-btn-danger"
                                type="button"
                                onClick={() => removeFonction(index)}
                                aria-label={`Supprimer fonction ${index + 1}`}
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                    <button type="button" className="vt-btn-ghost" onClick={addFonction}>
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
                                value={effet.type}
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
                                value={effet.description}
                                onChange={(e) => handleEffetChange(index, "description", e.target.value)}
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
                    <button type="submit" className="vt-btn-primary">Créer la vitamine</button>
                </div>
            </form>
        </Page>
    );
}

export default VitamineCreator;
