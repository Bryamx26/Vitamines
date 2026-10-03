import { useState } from "react";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { UploadIcon } from "../Icons.jsx";

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
        } catch {
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
            handleError("Veuillez saisir un JSON valide.");
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
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // réservé aux admins
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
            handleError("L'envoi a échoué. Vérifiez le fichier puis réessayez."); // fallback générique
        }
    };

    return (
        <div className="vt-upload">
            <h3 className="vt-display vt-panel-title">Ajouter un aliment</h3>
            <div className="vt-field">
                <label htmlFor="upload-nom">Nom de l'aliment</label>
                <input
                    id="upload-nom"
                    className="vt-input"
                    type="text"
                    value={nom}
                    onChange={handleNomChange}
                />
            </div>
            <div className="vt-field">
                <label htmlFor="upload-type">Type</label>
                <select id="upload-type" className="vt-input" value={type} onChange={handleTypeChange}>
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
            </div>
            <div className="vt-field">
                <label htmlFor="upload-file">Image (SVG ou PNG)</label>
                <input
                    id="upload-file"
                    className="vt-input vt-file"
                    type="file"
                    accept=".svg,.png"
                    onChange={handleFileChange}
                />
            </div>
            <div className="vt-field">
                <label htmlFor="json">Apports (JSON)</label>
                <input id="json" className="vt-input" type="text" onChange={handleJsonChnageChange} />
            </div>
            <button className="vt-btn-primary vt-btn-block" type="button" onClick={handleUpload}>
                <UploadIcon size={18} /> Envoyer
            </button>
        </div>
    );
}

export default UploadFiles;
