
// VitamineEditor.jsx
import React, {useContext, useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Layouts/Header.jsx";
import {ThemeContext} from "../Context/ThemeContext.jsx";

export default function VitamineEditor() {
    const {isDark} = useContext(ThemeContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [vitamine, setVitamine] = useState({ nom: "", description: "", couleur: "#5e80c8" });
  const [effets, setEffets] = useState([]);
  const [fonctions, setFonctions] = useState([]);

  // Charge les données initiales
  useEffect(() => {
    async function fetchData() {
      try {
        // Vitamine
        const vitRes = await fetch(`http://localhost:3000/vitamines/id/${id}`);
    if (!vitRes.ok) throw new Error("Erreur récupération vitamine");
const vitData = await vitRes.json();
setVitamine({ nom: vitData.nom, description: vitData.description, couleur: vitData.couleur , nom_scientifique: vitData.nom_scientifique });

// Effets
const effRes = await fetch(`http://localhost:3000/vitamines/${id}/effets`);
const effData = await effRes.json();
setEffets(effData.map(e => ({ id: e.id, type: e.type_effet, description: e.description })));

// Fonctions
const fnRes = await fetch(`http://localhost:3000/vitamines/${id}/fonctions`);
const fnData = await fnRes.json();
setFonctions(fnData.map(f => ({ id: f.id, nom: f.nom, description: f.description })));
} catch (err) {
    console.error(err);
    alert("Impossible de charger la vitamine");
}
}
fetchData();
}, [id]);

// Handlers copyés de Creator
const handleVitamineChange = ({ target: { name, value } }) => {
    setVitamine(v => ({ ...v, [name]: value }));
};
const handleEffetChange = (i, field, value) => {
    const arr = [...effets]; arr[i][field] = value; setEffets(arr);
};
const handleFonctionChange = (i, field, value) => {
    const arr = [...fonctions]; arr[i][field] = value; setFonctions(arr);
};
const addEffet = () => setEffets([...effets, { type: "avantage", description: "" }]);
const removeEffet = i => setEffets(effets.filter((_, idx) => idx !== i));
const addFonction = () => setFonctions([...fonctions, { nom: "", description: "" }]);
const removeFonction = i => setFonctions(fonctions.filter((_, idx) => idx !== i));

// Soumission mise à jour
const handleSubmit = async e => {
    e.preventDefault();
    try {
        const res = await fetch(`http://localhost:3000/vitamines/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...vitamine, effets, fonctions })
        });
        if (!res.ok) throw new Error();
        alert("Vitamine mise à jour !");
        navigate(-1);
    } catch {
        alert("Erreur lors de la mise à jour");
    }
};

// Suppression
const handleDelete = async () => {
    if (!window.confirm("Confirmer suppression ?")) return;
    try {
        const res = await fetch(`http://localhost:3000/vitamines/${id}`, { method: "DELETE" });
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
        <form onSubmit={handleSubmit} style={{backgroundColor:isDark? "black": vitamine.couleur} }  className="vitamineForm">

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
                <p>Éditer Vitamine </p>
            </div>
            <div className="NomInput">
                <input name="nom" value={vitamine.nom} onChange={handleVitamineChange} required placeholder="Nom"  className="textInput"/>
            </div>
            <div className="vitamineContainer">
                <div className="vitamineCardContainer1">

                    <div className="vitamineCard vitamineDescription">
                        <div >
                            <p>Description</p>
                            <textarea name="description" value={vitamine.description} onChange={handleVitamineChange} required   className={"vitamineDescriptionInput"}/>
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


                                    <input  id="colorInput"
                                            className="hidden-color"
                                            type="color" name="couleur"
                                            value={vitamine.couleur}
                                            onChange={handleVitamineChange} />
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
                        <button  className="buttons" type="button" onClick={addFonction}>+ Fonction</button>
                        {fonctions.map((f, i) => (
                            <div  key={i} className="fonctionBloc" style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent : "space-evenly" }}>
                                <input placeholder={"Fonction"} className="textInput" value={f.nom} onChange={e => handleFonctionChange(i, 'nom', e.target.value)} required />
                                <input placeholder={"Description"} className="textInput" value={f.description} onChange={e => handleFonctionChange(i, 'description', e.target.value)} required />
                                <button  className="buttonsSupprimer" type="button" onClick={() => removeFonction(i)}>Supprimer</button>
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
                                <input name="nom_scientifique" value={vitamine.nom_scientifique} onChange={handleVitamineChange} required placeholder="Nom_scientifique"  className="textInput"/>
                            </div>

                            <div>

                                <button className="buttons"  type="submit">Enregistrer</button>
                                <button className="buttons"  type="button" onClick={handleDelete}>Supprimer</button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

        </form>
    </>
);
}

