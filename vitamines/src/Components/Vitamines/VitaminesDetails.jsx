import React, {useContext, useEffect, useState} from "react";
import Error from "../Pages/Error.jsx";
import { useParams } from "react-router-dom";
import VitamineCard from "./VitamineCard.jsx"; // <- utilisé ?
import Loading from "../Pages/Loading.jsx";
import Header from "../Layouts/Header.jsx";
import AlimentsGallery from "../Aliments/AlimentsGallery.jsx";
import { UserContext } from "/src/Components/context/UserContext.jsx"
import {useNavigate} from "react-router-dom";
import {ThemeContext} from "../context/ThemeContext.jsx";
import {useAPI} from "../context/APIContext.jsx";

function VitaminesDetails() {
    const API_URL = useAPI();
    const {isDark} = useContext(ThemeContext);
    const { id } = useParams();
    const [vitamine, setVitamine] = useState(null);
    const [fonctions, setFonctions] = useState([]);
    const [effects, setEffects] = useState([]);
    const [error, setError] = useState(null);
    const{user} = useContext(UserContext);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchVitamines = async () => {
            try {
                const response = await fetch(`${API_URL}/vitamines/id/${id}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setVitamine(data);
            } catch (err) {
                console.error("Erreur lors du fetch des vitamines:", err);
                setError(err);
            }
        };
        fetchVitamines();
    }, [id]);

    useEffect(() => {
        if (!vitamine?.nom) return;
        const fetchEffects = async () => {
            try {
                const response = await fetch(`${API_URL}/vitamines/${vitamine.id}/effets/`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                setEffects(data);

            } catch (err) {
                console.error("Erreur lors du fetch des effets:", err);
                setError(err);
            }
        };
        fetchEffects();
    }, [vitamine?.nom]);

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
    }, [id]);
    const Editer = () => {
        navigate(`/VitamineEditor/${id}`);
    };

    if (error) return <Error />;
    if (!vitamine) return <Loading />;

    const nom = vitamine.nom.replace("Vitamine ", "");

    const couleur = vitamine.couleur;


    return (
        <>
            <Header />
            <div id="detailsPage" style={{backgroundColor:isDark? "black": vitamine.couleur , transition: "all 0.6s ease-in-out" } }  >
                {isDark ? (
                    <>
                        <div className="vitamineTitleBacground2"
                             style={{
                                 background: isDark
                                     ? `radial-gradient(
                                    ${vitamine.couleur} 0%,
                                     rgba(5, 12, 241, 0.41) 30%,
                                     rgba(2, 2, 1, 0.02) 70%
                                        )`
                                     : null,
                             }}></div>
                        <div
                            className="vitamineTitleBacground"
                            style={{
                                background: isDark
                                    ? `radial-gradient(
                                    ${vitamine.couleur} 0%,
                                     rgba(5, 12, 241, 0.41) 30%,
                                     rgba(2, 2, 1, 0.02) 70%
                                        )`
                                    : null,
                            }}
                        ></div>

                    </>

                ):null}


                <div className="vitamineTitle">
                    <p>{vitamine.nom}</p>
                    {user ?<button className="buttons" onClick={Editer}>éditer</button> : null}


                </div>


                <div className="vitamineContainer">
                    <div className="vitamineCardContainer1">
                        <div className="vitamineCard vitamineDescription">
                           <p>{vitamine.description}</p>
                        </div>
                        <div className="vitamineAlimentGContainer">

                            <div className="vitamineQuantity"></div>
                            <div className="vitamineAliment">
                                <h3>Aliments riches en vitamine {nom}</h3>
                                <AlimentsGallery nom={vitamine.nom}  />
                            </div>
                        </div>
                    </div>
                    <div className="vitamineCardContainer2">

                        <div className="vitamineCard fonctions">
                            <h3>fonctions de la vitamene {nom}</h3>
                            {fonctions.map((font, i) => (

                                <p key={i}> <b>{font.nom}</b> {font.description}</p>
                            ))}
                        </div>
                        <div className="vitamineInfosContainer">
                            <div className="effects">

                                        <b>Avantages</b>
                                        {effects
                                            .filter(effect => effect.type_effet === "avantage")
                                            .map((effect, index) => (
                                                <p key={`avantage-${index}`}>{effect.description}</p>
                                            ))}

                                        <b>Carences</b>
                                        {effects
                                            .filter(effect => effect.type_effet === "carence")
                                            .map((effect, index) => (
                                                <p key={`carence-${index}`}>{effect.description}</p>
                                            ))}

                                        <b>Excès</b>
                                        {effects
                                            .filter(effect => effect.type_effet === "excès")
                                            .map((effect, index) => (
                                                <p key={`exces-${index}`}>{effect.description}</p>
                                            ))}


                            </div>

                            <div className="calculateur"></div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default VitaminesDetails;
