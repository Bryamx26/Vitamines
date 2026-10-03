
import { useNavigate } from "react-router-dom";
import { FAMILLE_LABELS, vitamineCode, vitamineFamille, vitamineTone } from "./vitamineMeta.js";

function VitamineCard({ vitamine, cliquable }) {
    const navigate = useNavigate();

    const handleClick = () => {

        (cliquable) ? navigate(`/vitamines/id/${vitamine.id}`) : console.log("vitamine not found");
    }

    const lettre = vitamineCode(vitamine.nom) || vitamine.nom.replace("Vitamine ", "");
    const famille = vitamineFamille(vitamine.nom);

    return (
        <button
            type="button"
            className={`vt-bubble tone-${vitamineTone(vitamine.nom)}`}
            onClick={function () { handleClick() }}
            aria-label={`${vitamine.nom}${vitamine.nom_scientifique ? ", " + vitamine.nom_scientifique : ""}`}
        >
            <span className="vt-bubble-letter">{lettre}</span>
            {vitamine.nom_scientifique && <span className="vt-bubble-name">{vitamine.nom_scientifique}</span>}
            {famille && <span className="vt-bubble-family">{FAMILLE_LABELS[famille]}</span>}
        </button>
    )

}

export default VitamineCard;
