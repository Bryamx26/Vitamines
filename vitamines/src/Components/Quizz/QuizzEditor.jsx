import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import Loading from "../Pages/Loading.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { PlusIcon } from "../Icons.jsx";
import AdminOnly from "./AdminOnly.jsx";
import QuizzQuestion from "./QuizzQuestion.jsx";
import { STATUTS, toneOf } from "./quizzMeta.js";

const reponseVide = (statut = "fausse") => ({ texte: "", statut, explication: "" });

// Création (/quiz/creer) et modification (/quiz/:id/modifier) d'une question — admin.
function QuizzEditor() {
    const API_URL = useAPI();
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [vitamines, setVitamines] = useState([]);
    const [choix, setChoix] = useState(new Set());
    const [question, setQuestion] = useState("");
    const [correction, setCorrection] = useState("");
    const [reponses, setReponses] = useState([reponseVide("correcte"), reponseVide(), reponseVide()]);
    const [apercu, setApercu] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        const charger = async () => {
            try {
                const rv = await fetch(`${API_URL}/nutriments?categorie=vitamine`);
                const liste = rv.ok ? await rv.json() : [];
                if (id) {
                    const rq = await fetch(`${API_URL}/quizz/${id}`);
                    if (!rq.ok) throw new Error("Question introuvable");
                    const q = await rq.json();
                    setQuestion(q.question);
                    setCorrection(q.correction);
                    setReponses(q.reponses.map((r) => ({ texte: r.texte, statut: r.statut, explication: r.explication || "" })));
                    setChoix(new Set(q.nutriments.map((n) => n.id)));
                    // Un nutriment lié qui n'est pas une vitamine reste affiché
                    q.nutriments.forEach((n) => { if (!liste.some((v) => v.id === n.id)) liste.push(n); });
                }
                setVitamines(liste);
            } catch (e) {
                setErreur(e.message);
            } finally {
                setChargement(false);
            }
        };
        charger();
    }, [API_URL, id]);

    const toggleVitamine = (vid) => setChoix((prev) => {
        const next = new Set(prev);
        next.has(vid) ? next.delete(vid) : next.add(vid);
        return next;
    });

    const changerReponse = (i, champ, valeur) =>
        setReponses((prev) => prev.map((r, j) => (j === i ? { ...r, [champ]: valeur } : r)));
    const ajouterReponse = () => setReponses((prev) => [...prev, reponseVide()]);
    const retirerReponse = (i) => setReponses((prev) => prev.filter((_, j) => j !== i));

    const remplies = reponses.filter((r) => r.texte.trim());
    const problemes = [
        !choix.size && "choisis au moins une vitamine",
        !question.trim() && "écris la question",
        remplies.length < 2 && "il faut au moins 2 réponses",
        !remplies.some((r) => r.statut === "correcte") && "il faut au moins une réponse correcte",
        !correction.trim() && "écris la correction",
    ].filter(Boolean);

    // Aperçu : la question telle que la verra le joueur, bonnes réponses cochées
    const apercuQuestion = {
        id: "apercu",
        question: question || "…",
        correction: correction || "…",
        nutriments: vitamines.filter((v) => choix.has(v.id)),
        reponses: remplies.map((r, i) => ({ ...r, id: i })),
    };
    const apercuCoches = new Set(apercuQuestion.reponses.filter((r) => r.statut === "correcte").map((r) => r.id));

    const enregistrer = async (e) => {
        e.preventDefault();
        if (problemes.length) {
            showNotification(`Avant d'enregistrer : ${problemes.join(", ")}.`, "error");
            return;
        }
        setEnvoi(true);
        try {
            const r = await fetch(id ? `${API_URL}/quizz/${id}` : `${API_URL}/quizz`, {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // réservé aux admins
                },
                body: JSON.stringify({ nutriment_ids: [...choix], question, correction, reponses: remplies }),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(data.error || `Erreur ${r.status}`);
            showNotification(id ? "Question modifiée." : "Question créée.", "success");
            navigate("/quiz/gestion");
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <AdminOnly>
            <Page>
                <section className="vt-hero">
                    <p className="vt-eyebrow">Administration</p>
                    <h1 className="vt-display vt-hero-title">{id ? "Modifier la question" : "Nouvelle question"}</h1>
                </section>

                {chargement ? <Loading /> : erreur ? (
                    <section className="vt-card vt-quiz-card vt-quiz">
                        <p className="vt-empty">{erreur}</p>
                        <Link to="/quiz/gestion" className="vt-btn-ghost">Retour à la liste</Link>
                    </section>
                ) : (
                    <form className="vt-admin-form vt-quiz" onSubmit={enregistrer}>
                        <section className="vt-panel tone-leaf">
                            <h2 className="vt-display vt-panel-title">Vitamines concernées</h2>
                            <div className="vt-filters" role="group" aria-label="Vitamines concernées">
                                {vitamines.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        className={`vt-badge vt-filter tone-${toneOf(v)}`}
                                        aria-pressed={choix.has(v.id)}
                                        onClick={() => toggleVitamine(v.id)}
                                    >
                                        {v.nom}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="vt-panel tone-sky">
                            <h2 className="vt-display vt-panel-title">Question</h2>
                            <div className="vt-field">
                                <label htmlFor="quizz-question">Énoncé</label>
                                <textarea
                                    id="quizz-question"
                                    className="vt-input vt-textarea vt-quiz-textarea"
                                    placeholder="Quelles vitamines sont liposolubles ?"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    required
                                />
                            </div>
                        </section>

                        <section className="vt-panel tone-peach">
                            <h2 className="vt-display vt-panel-title">Réponses</h2>
                            <p className="vt-quiz-hint">
                                Marque chaque réponse comme correcte, incomplète ou fausse. L'explication s'affiche au joueur après validation.
                            </p>
                            {reponses.map((r, i) => (
                                <div key={i} className={`vt-quiz-edit-row is-${r.statut}`}>
                                    <input
                                        className="vt-input"
                                        type="text"
                                        maxLength={255}
                                        placeholder={`Réponse ${i + 1}`}
                                        aria-label={`Texte de la réponse ${i + 1}`}
                                        value={r.texte}
                                        onChange={(e) => changerReponse(i, "texte", e.target.value)}
                                    />
                                    <select
                                        className="vt-input"
                                        aria-label={`Statut de la réponse ${i + 1}`}
                                        value={r.statut}
                                        onChange={(e) => changerReponse(i, "statut", e.target.value)}
                                    >
                                        {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <input
                                        className="vt-input"
                                        type="text"
                                        placeholder="Explication (facultatif)"
                                        aria-label={`Explication de la réponse ${i + 1}`}
                                        value={r.explication}
                                        onChange={(e) => changerReponse(i, "explication", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="vt-btn-ghost vt-btn-danger"
                                        onClick={() => retirerReponse(i)}
                                        disabled={reponses.length <= 2}
                                        aria-label={`Supprimer la réponse ${i + 1}`}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="vt-btn-ghost" onClick={ajouterReponse}>
                                <PlusIcon size={18} /> Ajouter une réponse
                            </button>
                        </section>

                        <section className="vt-panel tone-butter">
                            <h2 className="vt-display vt-panel-title">Correction</h2>
                            <div className="vt-field">
                                <label htmlFor="quizz-correction">Affichée après la réponse du joueur</label>
                                <textarea
                                    id="quizz-correction"
                                    className="vt-input vt-textarea vt-quiz-textarea"
                                    placeholder="Les vitamines A, D, E et K se dissolvent dans les graisses…"
                                    value={correction}
                                    onChange={(e) => setCorrection(e.target.value)}
                                    required
                                />
                            </div>
                        </section>

                        {apercu && (
                            <QuizzQuestion question={apercuQuestion} coches={apercuCoches} valide onToggle={() => {}} />
                        )}

                        <div className="vt-actions">
                            <button type="button" className="vt-btn-ghost" onClick={() => setApercu(!apercu)}>
                                {apercu ? "Masquer l'aperçu" : "Aperçu"}
                            </button>
                            <Link to="/quiz/gestion" className="vt-btn-ghost">Annuler</Link>
                            <button type="submit" className="vt-btn-primary" disabled={envoi}>
                                {id ? "Enregistrer" : "Créer la question"}
                            </button>
                        </div>
                    </form>
                )}
            </Page>
        </AdminOnly>
    );
}

export default QuizzEditor;
