import { useState } from "react";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import {data} from "react-router";

function UploadFiles({ onUpload }) {
    const { showNotification } = useNotification();
    const API_URL = useAPI();
    const [nom, setNom] = useState("");
    const [type, setType] = useState("");
    const [file, setFile] = useState(null);
    const [json, setJson] = useState("");

    const handleNomChange = (e) => setNom(e.target.value);
    const handleTypeChange = (e) => setType(e.target.value);
    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleJsonChnageChange = (e) => setJson(e.target.value);

    const handleSuccess = (reponse) => {
        showNotification(`${reponse}`, "success");
    };

    const handleError = (mess) => {
        showNotification(mess, "error");
    };
    function isJSON(str) {
        if (typeof str !== "string") return false; // ce n'est pas une string
        try {
            const parsed = JSON.parse(str);
            return typeof parsed === "object" && parsed !== null; // doit être un objet ou un tableau
        } catch (e) {
            return false; // erreur => pas un JSON
        }
    }

    const handleUpload = async () => {
        if (!nom) {
            handleError("Veuillez entrer le nom de l'aliment !");
            return;
        }
        if (!type) {
            handleError("Veuillez entrer le type de l'aliment !");
            return;
        }
        if (!file) {
            handleError("Veuillez sélectionner un fichier SVG ou PNG !");
            return;
        }
        if (!json || !isJSON(json)) {
            handleError("Veuillez introduire  un Json");
            return;
        }

        const formData = new FormData();
        formData.append("nom", nom);
        formData.append("type", type);
        formData.append("File", file);
        formData.append("json", JSON.stringify(json));

        try {
            const res = await fetch(`${API_URL}/uploadAliment`, {
                method: "POST",
                body: formData,
            });

            if (res.status === 400) {
                const error = await res.json();
                handleError(error.error); // on affiche l'erreur envoyée par le back
                return; // on arrête ici pour ne pas continuer
            }

            if (!res.ok) {
                throw new Error("Erreur serveur");
            }

            const data = await res.json();
            handleSuccess(data.message);
            console.log(data.message);

            // Reset des champs
            setNom("");
            setType("");
            setFile(null);
            setJson("");

            if (onUpload) onUpload(data); // callback pour le parent

        } catch (err) {
            console.error(err);
            handleError("❌ Une erreur est survenue"); // fallback générique
        }
    };

    return (
        <div className="upload-files">
            <h3>Ajouter un aliment</h3>
            <input
                className="upload-file-input"
                type="text"
                placeholder="Nom de l'aliment"
                value={nom}
                onChange={handleNomChange}
            />
            <select className="upload-file-input" value={type} onChange={handleTypeChange}>
                <option value="">Sélectionner le type</option>
                <option value="fruit">Fruit</option>
                <option value="legume">Légume</option>
                <option value="aliment">Aliment</option>
                <option value="boisson">Boisson</option>
                <option value="produit-laitier">Produit laitier</option>
                <option value="cereale">Céréale</option>
                <option value="proteine-animale">Protéine animale</option>
                <option value="proteine-vegetale">Protéine végétale</option>
                <option value="graisse">Graisse</option>
                <option value="sucre">Sucre</option>
                <option value="oleagineux">Oléagineux</option>
                <option value="legumineuse">Légumineuse</option>
                <option value="epice">Épice</option>
                <option value="herbe-aromatique">Herbe aromatique</option>
                <option value="produit-transforme">Produit transformé</option>
                <option value="poisson">Poisson</option>
                <option value="viande-rouge">Viande rouge</option>
                <option value="viande-blanche">Viande blanche</option>
            </select>
            <input
                className="upload-file-input"
                type="file"
                accept=".svg,.png"
                onChange={handleFileChange}
            />
            <label htmlFor="json" className="upload-file-input">Json</label>
            <input  id={"json"} className="upload-file-input" type="text" onChange={handleJsonChnageChange} />
            <button className="upload-button" type="button" onClick={handleUpload}>
                <p>Upload</p>
                <img className="upload-image" src="/images/upload.svg" alt="upload" />
            </button>
        </div>
    );
}

export default UploadFiles;
