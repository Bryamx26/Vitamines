import React, { useContext, useEffect, useState } from "react";
import Error from "../Pages/Error.jsx";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Loading from "../Pages/Loading.jsx";
import Page from "../Layouts/Page.jsx";
import AlimentsGallery from "../Aliments/AlimentsGallery.jsx";
import { UserContext } from "/src/Components/context/UserContext.jsx"
import { useNavigate } from "react-router-dom";
import { useAPI } from "../context/APIContext.jsx";
import Quantity from "./Quantity.jsx";
import { FAMILLE_LABELS, vitamineFamille, vitamineStockage, vitamineTone } from "./vitamineMeta.js";

const EFFETS = [
    { type: "avantage", label: "Apport adéquat" },
    { type: "carence", label: "Carence" },
    { type: "excès", label: "Excès" },
];

function VitaminesDetails() {
    const location = useLocation();
    const API_URL = useAPI();
    const { id } = useParams();
    const [vitamine, setVitamine] = useState(null);
    const [fonctions, setFonctions] = useState([]);
    const [effects, setEffects] = useState([]);
    const [alimentsCount, setAlimentsCount] = useState(0);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchVitamines = async () => {
            try {
                // Fiche nutriment : contient l'accent (tone) et la famille choisis en base
                const response = await fetch(`${API_URL}/nutriments/${id}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setVitamine({ ...data, gramage: data.apport_principal?.valeur_min ?? null });

            } catch (err) {
                console.error("Erreur lors du fetch des vitamines:", err);
                setError(err);
            }
        };
        fetchVitamines();
    }, [id, location.search]);

    useEffect(() => {
        const fetchEffects = async () => {
            try {
                const response = await fetch(`${API_URL}/vitamines/${id}/effects`);

                if (response.ok) {
                    const data = await response.json();
                    setEffects(Array.isArray(data) ? data : []);
                } else if (response.status === 404) {
                    // Aucun effet → tableau vide
                    setEffects([]);
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

            } catch (err) {
                console.error("Erreur lors du fetch des effets:", err.message || err);
                setEffects([]); // on met un tableau vide en cas d'erreur pour ne pas planter le composant
            }
        };

        fetchEffects();
    }, [API_URL, id]);

    useEffect(() => {
        const fetchFonctions = async () => {
            try {
                const response = await fetch(`${API_URL}/vitamines/${id}/fonctions`);
                if (!response.ok) throw new Error("Erreur lors du chargement des fonctions");
                const data = await response.json();
                setFonctions(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFonctions();
    }, [id, location.search]);
    const Editer = () => {
        navigate(`/VitamineEditor/${id}`);
    };

    if (error) return <Error />;
    if (!vitamine) return <Loading />;

    const famille = vitamineFamille(vitamine.nom, vitamine.famille);
    const stockage = vitamineStockage(vitamine.nom);
    const effetsGroupes = EFFETS
        .map((g) => ({ ...g, items: effects.filter((effect) => effect.type_effet === g.type) }))
        .filter((g) => g.items.length > 0);
    const hasFonctions = Array.isArray(fonctions) && fonctions.length > 0;

    return (
        <Page tinted tone={vitamineTone(vitamine.nom, vitamine.tone)}>
            <section className="vt-hero vt-on-tone">
                <p className="vt-eyebrow">
                    Fiche {String(id).padStart(2, "0")}{famille ? ` · ${FAMILLE_LABELS[famille]}` : ""}
                </p>
                <h1 className="vt-display vt-hero-title vt-hero-title-xl">{vitamine.nom}</h1>
                {vitamine.nom_scientifique && <p className="vt-lead">{vitamine.nom_scientifique}</p>}
                {user && user.role === "admin" ?
                    <button type="button" className="vt-btn-ghost" onClick={Editer}>Éditer la fiche</button> : null}
            </section>

            <div className="vt-stats">
                {vitamine.gramage != null && (
                    <div className="vt-card vt-stat">
                        <p className="vt-stat-label">Apport conseillé</p>
                        <Quantity quantity={vitamine.gramage} />
                    </div>
                )}
                {famille && (
                    <div className="vt-card vt-stat">
                        <p className="vt-stat-label">Famille</p>
                        <span className={`vt-badge tone-${famille === "liposoluble" ? "butter" : "sky"}`}>
                            {FAMILLE_LABELS[famille]}
                        </span>
                    </div>
                )}
                {stockage && (
                    <div className="vt-card vt-stat">
                        <p className="vt-stat-label">Stockage</p>
                        <p className="vt-stat-text">{stockage}</p>
                    </div>
                )}
            </div>

            {(vitamine.description || hasFonctions) && (
                <div className="vt-grid-2">
                    {vitamine.description && (
                        <section className="vt-panel tone-sky">
                            <h2 className="vt-display vt-panel-title">Description</h2>
                            <p className="vt-prewrap">{vitamine.description.trim()}</p>
                        </section>
                    )}
                    {hasFonctions && (
                        <section className="vt-panel tone-leaf">
                            <h2 className="vt-display vt-panel-title">Fonctions</h2>
                            <dl className="vt-facts">
                                {fonctions.map((font, i) => (
                                    <div className="vt-fact" key={i}>
                                        <dt>{font.nom.trim()}</dt>
                                        <dd>{font.description?.trim()}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    )}
                </div>
            )}

            <div className={`vt-grid-3-2${alimentsCount === 0 || effetsGroupes.length === 0 ? " vt-grid-single" : ""}`}>
                {effetsGroupes.length > 0 && (
                    <section className="vt-panel tone-peach">
                        <h2 className="vt-display vt-panel-title">Effets</h2>
                        <dl className="vt-facts">
                            {effetsGroupes.map((g) => (
                                <div className="vt-fact" key={g.type}>
                                    <dt>{g.label}</dt>
                                    {g.items.map((effect, index) => (
                                        <dd key={`${g.type}-${index}`}>{effect.description}</dd>
                                    ))}
                                </div>
                            ))}
                        </dl>
                    </section>
                )}
                <section className="vt-panel tone-butter" hidden={alimentsCount === 0}>
                    <h2 className="vt-display vt-panel-title">Où la trouver</h2>
                    <AlimentsGallery nom={vitamine.nom} onCount={setAlimentsCount} />
                </section>
            </div>
        </Page>
    );
}

export default VitaminesDetails;
