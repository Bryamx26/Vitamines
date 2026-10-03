import { useEffect, useState } from "react";
import { useAPI } from "../context/APIContext.jsx";
// Assure-toi que le chemin d'import est correct selon ton dossier
import AlimentsGallery from "./AlimentsGallery.jsx";
import { CheckIcon, CloseIcon } from "../Icons.jsx";

function AssociationModal({ open, setOpen, vitamineId, nom }) { // Ajout de 'nom' ici
    const API_URL = useAPI();
    const [aliments, setAliments] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    // 1. Charger les aliments à l'ouverture
    useEffect(() => {
        if (open) {
            const fetchAliments = async () => {
                try {
                    const res = await fetch(`${API_URL}/aliments/`);
                    if (res.ok) {
                        const data = await res.json();
                        setAliments(data);
                    }
                } catch (err) {
                    console.error("Erreur chargement aliments:", err);
                }
            };
            fetchAliments();
            setSelectedIds([]); // Reset la sélection
        }
    }, [open, API_URL]);

    if (!open) return null;

    // 2. Gestion du clic (Selection)
    const toggleAliment = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // 3. Action API (Lier / Délier)
    const handleAction = async (actionType) => {
        if (selectedIds.length === 0) return;
        if (!vitamineId) {
            alert("Erreur: ID Vitamine manquant");
            return;
        }

        const endpoint = actionType === "associate" ? "/aliments/associate" : "/aliments/dissociate";
        const method = actionType === "associate" ? "POST" : "DELETE";

        const promises = selectedIds.map(alimentId => 
            fetch(`${API_URL}${endpoint}`, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // réservé aux admins
                },
                body: JSON.stringify({ alimentId, vitamineId })
            })
        );

        try {
            const responses = await Promise.all(promises);
            if (responses.some((r) => !r.ok)) throw new Error("Réponse refusée par l'API");
            alert(actionType === "associate" ? "Association réussie !" : "Désassociation réussie !");
            setSelectedIds([]); 
            // setOpen(false); // Optionnel : fermer après action
        } catch (error) {
            console.error("Erreur API:", error);
            alert("Une erreur est survenue.");
        }
    };

    return (
        <div className="vt-modal-backdrop">
            <div className="vt-modal vt-modal-wide" role="dialog" aria-modal="true" aria-labelledby="association-title">
                <button
                    type="button"
                    className="vt-modal-close"
                    onClick={() => setOpen(false)}
                    aria-label="Fermer"
                >
                    <CloseIcon size={20} />
                </button>

                <h2 id="association-title" className="vt-display vt-title">Associations</h2>

                <div className="vt-modal-split">

                    {/* COLONNE GAUCHE : Tous les aliments (Sélection) */}
                    <section className="vt-modal-col">
                        <h3 className="vt-label">Sélectionner</h3>
                        <ul className="vt-foods">
                            {Array.isArray(aliments) && aliments.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <li className="vt-food" key={item.id}>
                                        <button
                                            type="button"
                                            className="vt-food-pill vt-food-select"
                                            aria-pressed={isSelected}
                                            aria-label={item.nom}
                                            onClick={() => toggleAliment(item.id)}
                                        >
                                            <img src={`/images/alimentsImages/${item.path}`} alt="" />
                                            {isSelected && <span className="vt-food-check"><CheckIcon size={22} /></span>}
                                        </button>
                                        <span className="vt-food-name">{item.nom}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* COLONNE DROITE : Aliments déjà associés (Référence) */}
                    <section className="vt-modal-col">
                        <h3 className="vt-label">Actuellement liés</h3>
                        {/* On passe le nom de la vitamine pour que la gallery s'affiche */}
                        <AlimentsGallery nom={nom} />
                    </section>
                </div>

                <div className="vt-actions">
                    <button
                        type="button"
                        className="vt-btn-primary"
                        onClick={() => handleAction("associate")}
                        disabled={selectedIds.length === 0}
                    >
                        Lier ({selectedIds.length})
                    </button>

                    <button
                        type="button"
                        className="vt-btn-ghost vt-btn-danger"
                        onClick={() => handleAction("dissociate")}
                        disabled={selectedIds.length === 0}
                    >
                        Délier ({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssociationModal;
