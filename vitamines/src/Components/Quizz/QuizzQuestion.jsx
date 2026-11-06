import { Link } from "react-router-dom";
import { CheckIcon, CloseIcon } from "../Icons.jsx";
import { STATUT_LABELS, VERDICTS, toneOf, verdict } from "./quizzMeta.js";

// Une question : cases à cocher, puis, une fois validée, chaque réponse colorée
// selon son statut, les bonnes réponses oubliées et la correction.
function QuizzQuestion({ question, coches, valide, onToggle, numero, total }) {
    const v = valide ? verdict(question, coches) : null;

    // Ce que la réponse devient après validation
    const etat = (r) => {
        const cochee = coches.has(r.id);
        if (cochee) return r.statut;
        if (r.statut === "correcte") return "oubliee";
        return null; // fausse ou incomplète non cochée : rien à signaler
    };

    return (
        <article className="vt-card vt-quiz-card" aria-labelledby={`q-${question.id}`}>
            <div className="vt-quiz-meta">
                {numero && <p className="vt-label">Question {numero} / {total}</p>}
                <div className="vt-quiz-tags">
                    {question.nutriments.map((n) => (
                        <span key={n.id} className={`vt-badge vt-quiz-tag tone-${toneOf(n)}`}>{n.symbole || n.nom}</span>
                    ))}
                </div>
            </div>

            <h2 id={`q-${question.id}`} className="vt-display vt-quiz-question">{question.question}</h2>
            {!valide && <p className="vt-quiz-hint">Coche une ou plusieurs réponses, puis valide.</p>}

            <ul className="vt-quiz-answers">
                {question.reponses.map((r) => {
                    const e = valide ? etat(r) : null;
                    const cochee = coches.has(r.id);
                    return (
                        <li key={r.id}>
                            <label className={["vt-quiz-answer", cochee && "is-checked", e && `is-${e}`, valide && "is-locked"].filter(Boolean).join(" ")}>
                                <input
                                    type="checkbox"
                                    checked={cochee}
                                    disabled={valide}
                                    onChange={() => onToggle(r.id)}
                                />
                                <span className="vt-quiz-box" aria-hidden="true">
                                    {cochee && <CheckIcon size={16} />}
                                </span>
                                <span className="vt-quiz-answer-body">
                                    <span className="vt-quiz-answer-text">{r.texte}</span>
                                    {e && (
                                        <span className="vt-quiz-status">
                                            {e === "oubliee" ? "Bonne réponse oubliée" : STATUT_LABELS[r.statut]}
                                            {r.explication ? ` — ${r.explication}` : ""}
                                        </span>
                                    )}
                                </span>
                                {e === "correcte" && <CheckIcon size={20} className="vt-quiz-mark" />}
                                {e === "fausse" && <CloseIcon size={20} className="vt-quiz-mark" />}
                            </label>
                        </li>
                    );
                })}
            </ul>

            {valide && (
                <div className={`vt-quiz-correction tone-${VERDICTS[v].tone}`} role="status">
                    <p className="vt-quiz-verdict">
                        <span className={`vt-badge tone-${VERDICTS[v].tone}`}>{VERDICTS[v].label}</span>
                    </p>
                    <p className="vt-label">Correction</p>
                    <p className="vt-prewrap">{question.correction}</p>
                    <p className="vt-quiz-links">
                        {question.nutriments.map((n) => (
                            <Link key={n.id} to={`/vitamines/id/${n.id}`}>Revoir la fiche {n.nom}</Link>
                        ))}
                    </p>
                </div>
            )}
        </article>
    );
}

export default QuizzQuestion;
