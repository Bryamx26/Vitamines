
import { useNavigate } from "react-router-dom";

function VitamineCard({ vitamine, cliquable }) {
    const navigate = useNavigate();

    const handleClick = () => {

        (cliquable) ? navigate(`/vitamines/id/${vitamine.id}`) : console.log("vitamine not found");
    }

    return (

        <div className="card" onClick={function () { handleClick() }}>
            <b className={"vitamineName"}>{vitamine.nom.replace("Vitamine ", "")}</b>


            <div className="card-body">

                <p id={"description"} className="invisible">
                    {vitamine.nom_scientifique}
                </p>
            </div>
        </div>
    )

}

export default VitamineCard;