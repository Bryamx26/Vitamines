import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Page from "../Layouts/Page.jsx";
import Loading from "../Pages/Loading.jsx";
import GalleryErrorBanner from "../Layouts/GalleryErrorBanner.jsx";
import { useAPI } from "../context/APIContext.jsx";
import { UserContext } from "../context/UserContext.jsx";
import QuizzQuestion from "./QuizzQuestion.jsx";
import { VERDICTS, melanger, toneOf, verdict } from "./quizzMeta.js";

const NOMBRES = [5, 10, 20];

// Page Quiz : choix des vitamines → questions une par une (correction immédiate) → récapitulatif.
function QuizzPage() {
    const API_URL = useAPI();
    const { user } = useContext(UserContext);
    const isAdmin = user && user.role === "admin";

    const [vitamines, setVitamines] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(false);

    const [choix, setChoix] = useState(new Set()); // vide = toutes
    const [nombre, setNombre] = useState(10);

    const [etape, setEtape] = useState("choix"); // choix | jeu | fin
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [coches, setCoches] = useState(new Set());
    const [valide, setValide] = useState(false);
    const [resultats, setResultats] = useState([]); // { question, coches, verdict }
    const [revoir, setRevoir] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/quizz/vitamines`)
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(setVitamines)
            .catch(() => setErreur(true))
            .finally(() => setChargement(false));
    }, [API_URL]);

    const toggleVitamine = (id) => {
        setChoix((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const lancer = async () => {
        setChargement(true);
        setErreur(false);
        try {
            const params = new URLSearchParams({ random: "1" });
            if (choix.size) params.set("nutriments", [...choix].join(","));
            if (nombre) params.set("limit", String(nombre));
            const r = await fetch(`${API_URL}/quizz?${params}`);
            if (!r.ok) throw new Error(r.status);
            const data = await r.json();
            setQuestions(data.map((q) => ({ ...q, reponses: melanger(q.reponses) })));
            setIndex(0);
            setCoches(new Set());
            setValide(false);
            setResultats([]);
            setRevoir(false);
            setEtape("jeu");
        } catch {
            setErreur(true);
        } finally {
            setChargement(false);
        }
    };

    const toggleReponse = (id) => {
        if (valide) return;
        setCoches((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const valider = () => {
        const q = questions[index];
        setResultats((prev) => [...prev, { question: q, coches, verdict: verdict(q, coches) }]);
        setValide(true);
    };

    const suivante = () => {
        if (index + 1 >= questions.length) {
            setEtape("fin");
        } else {
            setIndex(index + 1);
            setCoches(new Set());
            setValide(false);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const compte = (v) => resultats.filter((r) => r.verdict === v).length;
    const erreurs = resultats.filter((r) => r.verdict !== "juste");

    return (
        <Page>
            <section className="vt-hero">
                <p className="vt-eyebrow">Apprendre en jouant</p>
                <h1 className="vt-display vt-hero-title">Quiz</h1>
                {etape === "choix" && (
                    <p className="vt-lead">Choisis les vitamines sur lesquelles tu veux t'entraîner. La correction s'affiche après chaque question.</p>
                )}
                {isAdmin && (
                    <Link to="/quiz/gestion" className="vt-btn-ghost">Gérer les quiz</Link>
                )}
            </section>

            {chargement ? <Loading /> : erreur ? <GalleryErrorBanner /> : (
                <div className="vt-quiz">
                    {etape === "choix" && (
                        <section className="vt-card vt-quiz-card" aria-labelledby="choix-titre">
                            <h2 id="choix-titre" className="vt-display vt-panel-title">Vitamines</h2>
                            {vitamines.length === 0 ? (
                                <p className="vt-empty">Aucune question pour l'instant.{isAdmin ? " Crée la première depuis « Gérer les quiz »." : ""}</p>
                            ) : (
                                <>
                                    <div className="vt-filters vt-quiz-picker" role="group" aria-label="Choisir les vitamines">
                                        <button
                                            type="button"
                                            className="vt-badge vt-filter tone-leaf"
                                            aria-pressed={choix.size === 0}
                                            onClick={() => setChoix(new Set())}
                                        >
                                            Toutes
                                        </button>
                                        {vitamines.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                className={`vt-badge vt-filter tone-${toneOf(v)}`}
                                                aria-pressed={choix.has(v.id)}
                                                onClick={() => toggleVitamine(v.id)}
                                                title={`${v.nb_questions} question(s)`}
                                            >
                                                {v.nom.replace(/^Vitamine\s+/i, "Vit. ")} · {v.nb_questions}
                                            </button>
                                        ))}
                                    </div>

                                    <h2 className="vt-display vt-panel-title">Nombre de questions</h2>
                                    <div className="vt-filters" role="group" aria-label="Nombre de questions">
                                        {[...NOMBRES, null].map((n) => (
                                            <button
                                                key={n ?? "toutes"}
                                                type="button"
                                                className="vt-badge vt-filter tone-sky"
                                                aria-pressed={nombre === n}
                                                onClick={() => setNombre(n)}
                                            >
                                                {n ?? "Toutes"}
                                            </button>
                                        ))}
                                    </div>
                                    <button type="button" className="vt-btn-primary" onClick={lancer}>Lancer le quiz</button>
                                </>
                            )}
                        </section>
                    )}

                    {etape === "jeu" && questions.length === 0 && (
                        <section className="vt-card vt-quiz-card">
                            <p className="vt-empty">Aucune question pour cette sélection.</p>
                            <button type="button" className="vt-btn-ghost" onClick={() => setEtape("choix")}>Changer de vitamines</button>
                        </section>
                    )}

                    {etape === "jeu" && questions[index] && (
                        <>
                            <div className="vt-quiz-progress" aria-hidden="true">
                                <span style={{ width: `${((index + (valide ? 1 : 0)) / questions.length) * 100}%` }} />
                            </div>
                            <QuizzQuestion
                                key={questions[index].id}
                                question={questions[index]}
                                coches={coches}
                                valide={valide}
                                onToggle={toggleReponse}
                                numero={index + 1}
                                total={questions.length}
                            />
                            <div className="vt-actions">
                                {!valide ? (
                                    <button type="button" className="vt-btn-primary" onClick={valider} disabled={coches.size === 0}>Valider</button>
                                ) : (
                                    <button type="button" className="vt-btn-primary" onClick={suivante}>
                                        {index + 1 >= questions.length ? "Voir le résultat" : "Question suivante"}
                                    </button>
                                )}
                                <button type="button" className="vt-btn-ghost" onClick={() => setEtape("choix")}>Arrêter</button>
                            </div>
                        </>
                    )}

                    {etape === "fin" && (
                        <>
                            <section className="vt-card vt-quiz-card vt-quiz-summary" aria-labelledby="fin-titre">
                                <h2 id="fin-titre" className="vt-display vt-title">Résultat</h2>
                                <div className="vt-quiz-scores">
                                    {Object.entries(VERDICTS).map(([k, v]) => (
                                        <div key={k} className={`vt-quiz-score tone-${v.tone}`}>
                                            <span className="vt-display vt-quiz-score-n">{compte(k)}</span>
                                            <span className="vt-label">{v.label}{compte(k) > 1 ? "s" : ""}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="vt-lead">
                                    {erreurs.length === 0
                                        ? "Bravo, tout est juste !"
                                        : `${compte("juste")} sur ${resultats.length} juste${compte("juste") > 1 ? "s" : ""}. Revois tes erreurs pour mieux retenir.`}
                                </p>
                                <div className="vt-actions">
                                    {erreurs.length > 0 && (
                                        <button type="button" className="vt-btn-ghost" onClick={() => setRevoir(!revoir)}>
                                            {revoir ? "Masquer mes erreurs" : "Revoir mes erreurs"}
                                        </button>
                                    )}
                                    <button type="button" className="vt-btn-primary" onClick={lancer}>Recommencer</button>
                                    <button type="button" className="vt-btn-ghost" onClick={() => setEtape("choix")}>Changer de vitamines</button>
                                </div>
                            </section>
                            {revoir && erreurs.map((r) => (
                                <QuizzQuestion key={r.question.id} question={r.question} coches={r.coches} valide onToggle={() => {}} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </Page>
    );
}

export default QuizzPage;
