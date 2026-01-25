import { useEffect, useState } from "react";
import { useAPI } from "../context/APIContext.jsx";
// Assure-toi que le chemin d'import est correct selon ton dossier
import AlimentsGallery from "./AlimentsGallery.jsx"; 

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alimentId, vitamineId })
            })
        );

        try {
            await Promise.all(promises);
            alert(actionType === "associate" ? "Association réussie !" : "Désassociation réussie !");
            setSelectedIds([]); 
            // setOpen(false); // Optionnel : fermer après action
        } catch (error) {
            console.error("Erreur API:", error);
            alert("Une erreur est survenue.");
        }
    };

    return (
        <div className="AlimentsModalContainer">
            {/* --- CSS INTÉGRÉ --- */}
            <style>{`
                .AlimentsModalContainer {
                    position: fixed !important;
                    z-index: 1000 !important;
                    /* Largeur un peu plus grande pour accueillir les 2 colonnes */
                    width: 70% !important; 
                    max-width: 900px;
                }

                /* Zone principale divisée en 2 colonnes */
                .modal-split-view {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    height: 100%; /* Prend toute la hauteur du modal-top */
                    gap: 20px;
                    overflow: hidden;
                }

                /* Colonne de Gauche (Sélection) */
                .panel-selection {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    padding-right: 10px;
                }

                /* Colonne de Droite (Déjà associés) */
                .panel-gallery {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    border-left: 2px solid rgba(255, 255, 255, 0.2);
                    padding-left: 20px;
                    overflow-y: auto;
                    background-color: rgba(0,0,0,0.1); /* Fond sombre léger pour différencier */
                    border-radius: 10px;
                }

                .aliments-frame-selectable {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 15px;
                    padding: 10px;
                }

                /* --- Styles des bulles existants (inchangés) --- */
                .bubble-interactive {
                    position: relative;
                    cursor: pointer;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    transition: transform 0.2s ease, border 0.2s ease;
                    background-color: var(--glass-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .bubble-interactive:hover { transform: scale(1.05); }
                .bubble-interactive.selected { transform: scale(0.90); border: 2px solid white; }
                .bubble-interactive img { width: 40px; height: 40px; object-fit: cover; z-index: 1; }
                .overlay-dark {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.6); z-index: 10; pointer-events: none;
                    display: flex; align-items: center; justify-content: center;
                }
                .overlay-dark::after {
                    content: '✔'; color: #4CAF50; font-size: 1.5rem; font-weight: bold; text-shadow: 0 0 5px black;
                }

                /* --- Styles des boutons existants --- */
                .action-buttons-container { display: flex; gap: 20px; justify-content: center; align-items: center; width: 100%; }
                .btn-action {
                    font-family: 'Poppins', sans-serif; padding: 0.8rem 1.5rem; border-radius: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.2); color: white; font-weight: bold; cursor: pointer;
                    backdrop-filter: blur(10px); transition: transform 0.2s; font-size: 1rem;
                }
                .btn-action:hover { transform: scale(1.05); }
                .btn-action:disabled { opacity: 0.5; cursor: not-allowed; background: grey !important; transform: none; }
                .btn-action.associate { background: rgba(46, 204, 113, 0.5); }
                .btn-action.dissociate { background: rgba(231, 76, 60, 0.5); }
                
                .modal-top { flex-grow: 1; height: auto; min-height: 0; display: flex; flex-direction: column; padding: 10px; }

                /* Responsive pour mobile : passer en colonne */
                @media (max-width: 768px) {
                    .modal-split-view { flex-direction: column; overflow-y: scroll; }
                    .panel-gallery { border-left: none; border-top: 2px solid rgba(255,255,255,0.2); padding-left: 0; padding-top: 20px; }
                }
            `}</style>

            <img 
                className="modal-button" 
                src={"/images/close.svg"} 
                alt="close" 
                onClick={() => setOpen(false)} 
            />

            <div className="modal-top">
                
                <div className="modal-split-view">
                    
                    {/* COLONNE GAUCHE : Tous les aliments (Sélection) */}
                    <div className="panel-selection">
                        <h3 style={{ margin: "10px 0", fontSize: "1.2rem", textAlign: "center" }}>
                            Sélectionner
                        </h3>
                        <div className="aliments-frame-selectable">
                            {Array.isArray(aliments) && aliments.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <div 
                                        className={`bubble-interactive ${isSelected ? "selected" : ""}`} 
                                        key={item.id}
                                        onClick={() => toggleAliment(item.id)}
                                    >
                                        <img 
                                            src={`/images/alimentsImages/${item.path}`}
                                            alt={item.nom} 
                                            title={item.gramage} 
                                        />
                                        {isSelected && <div className="overlay-dark"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* COLONNE DROITE : Aliments déjà associés (Référence) */}
                    <div className="panel-gallery">
                        <h3 style={{ margin: "10px 0", fontSize: "1.2rem", textAlign: "center" }}>
                            Actuellement liés
                        </h3>
                        {/* On passe le nom de la vitamine pour que la gallery s'affiche */}
                        <AlimentsGallery nom={nom} />
                    </div>

                </div>
            </div>

            <div className="modal-bottom">
                <div className="action-buttons-container">
                    <button 
                        className="btn-action associate" 
                        onClick={() => handleAction("associate")}
                        disabled={selectedIds.length === 0}
                    >
                        Lier ({selectedIds.length})
                    </button>
                    
                    <button 
                        className="btn-action dissociate" 
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