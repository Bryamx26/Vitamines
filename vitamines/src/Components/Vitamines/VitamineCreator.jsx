import React, {useContext, useState} from "react";
import Header from "../Layouts/Header.jsx";
import {ThemeContext} from "../context/ThemeContext.jsx";
import{useAPI} from "../context/APIContext.jsx";
import AlimentsGallery from "../Aliments/AlimentsGallery.jsx";

function VitamineCreator() {
    const API_URL = useAPI()
    const {isDark} = useContext(ThemeContext);
    const [vitamine, setVitamine] = useState({
        nom: "",
        description: "",
        nom_scientifique: "",
        couleur: "#5e80c8",
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
                setVitamine({ nom: "", description: "", couleur: "#d35e5e", nom_scientifique: "" });
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
        <>
            <Header/>
            <form id="detailsPage" style={{backgroundColor:isDark? "black": vitamine.couleur} } onSubmit={handleSubmit} className="vitamineForm">
                {isDark ? (
                    <>
                        <div className="vitamineTitleBacground2"
                             style={{
                                 background: isDark
                                     ? `radial-gradient(
                                    ${vitamine.couleur} 0%,
                                     rgba(5, 12, 241, 0.41) 30%,
                                     rgba(2, 2, 1, 0.02) 70%
                                        )`
                                     : null,
                             }}></div>
                        <div
                            className="vitamineTitleBacground"
                            style={{
                                background: isDark
                                    ? `radial-gradient(
                                    ${vitamine.couleur} 0%,
                                     rgba(5, 12, 241, 0.41) 30%,
                                     rgba(2, 2, 1, 0.02) 70%
                                        )`
                                    : null,
                            }}
                        ></div>

                    </>

                ):null}



                <div className="vitamineTitle">
                   <p>Vitamines Maker</p>


                </div>
                <div className="NomInput">

                    <input
                        type="text"
                        className="textInput"
                        name="nom"
                        autoComplete="off"
                        placeholder="Nom"
                        value={vitamine.nom}
                        onChange={handleVitamineChange}
                        required
                    />
                </div>

                <div className="vitamineContainer">
                    <div className="vitamineCardContainer1">

                        <div className="vitamineCard vitamineDescription">
                            <div >
                                <p>Description</p>
                                <textarea
                                    className={"vitamineDescriptionInput"}
                                    name="description"
                                    value={vitamine.description}
                                    onChange={handleVitamineChange}
                                    required
                                />
                            </div>


                        </div>
                        <div className="vitamineAlimentGContainer">

                            <div className="vitamineQuantity">

                               <div className="vitamineColorInput">
                                   <span className="input">Choisir une couleur </span>
                                   <label className="color-picker">

                                       <div
                                           className="preview"
                                           style={{ backgroundColor: vitamine.couleur }}
                                       ></div>

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
                            <div className="vitamineAliment">

                            </div>
                        </div>
                    </div>
                    <div className="vitamineCardContainer2">

                        <div className="vitamineCard fonctions">
                            <h3>Fonctions</h3>
                            <button  type="button" className="buttons" onClick={addFonction}>
                                + Ajouter fonction
                            </button>
                            {fonctions.map((f, index) => (
                                <div key={index} className="fonctionBloc" style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent : "space-evenly" }}>
                                    <input
                                        className="textInput"
                                        type="text"
                                        placeholder="Nom"
                                        value={f.nom}
                                        onChange={(e) => handleFonctionChange(index, "nom", e.target.value)}
                                        required
                                    />
                                    <input
                                        className="textInput"
                                        type="text"
                                        placeholder="Description"
                                        value={f.description}
                                        onChange={(e) => handleFonctionChange(index, "description", e.target.value)}
                                        required
                                    />
                                    <button
                                        className="buttonsSupprimer"
                                        type="button"
                                        onClick={() => removeFonction(index)}

                                        aria-label={`Supprimer fonction ${index + 1}`}
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

                                        style={{ display: "flex", gap: "10px", alignItems: "center"  }}
                                    >
                                        <select
                                            className="textInput"
                                            value={effet.type}
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
                                            value={effet.description}
                                            onChange={(e) => handleEffetChange(index, "description", e.target.value)}
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
                                        type="text"
                                        className="textInput"
                                        name="nom_scientifique"
                                        autoComplete="off"
                                        placeholder="Nom scientifique"
                                        value={vitamine.nom_scientifique}
                                        onChange={handleVitamineChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <button  type="submit" className={"buttons"}>
                                        Créer la vitamine
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

export default VitamineCreator;
