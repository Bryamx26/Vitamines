import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import Loading from "../Pages/Loading.jsx";
import GalleryErrorBanner from "../Layouts/GalleryErrorBanner.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { PlusIcon } from "../Icons.jsx";
import AdminOnly from "./AdminOnly.jsx";
import { toneOf } from "./quizzMeta.js";

// Gestion des questions (admin) : liste filtrable par vitamine, modifier, supprimer.
function QuizzAdmin() {
    const API_URL = useAPI();
    const { showNotification } = useNotification();
    const [questions, setQuestions] = useState([]);
    const [filtre, setFiltre] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/quizz`)
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(setQuestions)
            .catch(() => setErreur(true))
            .finally(() => setChargement(false));
    }, [API_URL]);

    // Vitamines présentes dans les questions (pour le filtre)
    const vitamines = [...new Map(questions.flatMap((q) => q.nutriments).map((n) => [n.id, n])).values()]
        .sort((a, b) => a.id - b.id);
    const affichees = filtre ? questions.filter((q) => q.nutriments.some((n) => n.id === filtre)) : questions;

    const supprimer = async (q) => {
        if (!window.confirm(`Supprimer la question « ${q.question} » ?`)) return;
        try {
            const r = await fetch(`${API_URL}/quizz/${q.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.status);
            setQuestions((prev) => prev.filter((x) => x.id !== q.id));
            showNotification("Question supprimée.", "success");
        } catch (e) {
            showNotification(`Suppression impossible : ${e.message}`, "error");
        }
    };

    return (
        <AdminOnly>
            <Page>
                <section className="vt-hero">
                    <p className="vt-eyebrow">Administration</p>
                    <h1 className="vt-display vt-hero-title">Gérer les quiz</h1>
                    <div className="vt-actions">
                        <Link to="/quiz/creer" className="vt-btn-primary"><PlusIcon size={18} /> Nouvelle question</Link>
                        <Link to="/quiz" className="vt-btn-ghost">Voir le quiz</Link>
                    </div>
                </section>

                {chargement ? <Loading /> : erreur ? <GalleryErrorBanner /> : (
                    <section className="vt-card vt-quiz-card vt-quiz" aria-label="Questions">
                        <div className="vt-filters" role="group" aria-label="Filtrer par vitamine">
                            <button type="button" className="vt-badge vt-filter tone-leaf" aria-pressed={filtre === null} onClick={() => setFiltre(null)}>
                                Toutes · {questions.length}
                            </button>
                            {vitamines.map((n) => (
                                <button key={n.id} type="button" className={`vt-badge vt-filter tone-${toneOf(n)}`} aria-pressed={filtre === n.id} onClick={() => setFiltre(n.id)}>
                                    {n.symbole || n.nom}
                                </button>
                            ))}
                        </div>

                        {affichees.length === 0 ? (
                            <p className="vt-empty">Aucune question. Clique sur « Nouvelle question » pour commencer.</p>
                        ) : (
                            <ul className="vt-quiz-list">
                                {affichees.map((q) => (
                                    <li key={q.id} className="vt-quiz-row">
                                        <div className="vt-quiz-row-main">
                                            <div className="vt-quiz-tags">
                                                {q.nutriments.map((n) => (
                                                    <span key={n.id} className={`vt-badge vt-quiz-tag tone-${toneOf(n)}`}>{n.symbole || n.nom}</span>
                                                ))}
                                            </div>
                                            <p className="vt-quiz-row-question">{q.question}</p>
                                            <p className="vt-quiz-hint">
                                                {q.reponses.length} réponses · {q.reponses.filter((r) => r.statut === "correcte").length} correcte(s)
                                            </p>
                                        </div>
                                        <div className="vt-quiz-row-actions">
                                            <Link to={`/quiz/${q.id}/modifier`} className="vt-btn-ghost">Modifier</Link>
                                            <button type="button" className="vt-btn-ghost vt-btn-danger" onClick={() => supprimer(q)}>Supprimer</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </Page>
        </AdminOnly>
    );
}

export default QuizzAdmin;
