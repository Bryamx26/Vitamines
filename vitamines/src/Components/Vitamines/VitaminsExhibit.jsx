import React, { useEffect, useState } from 'react';
import Error from "../Pages/Error.jsx";
import Loading from "../Pages/Loading.jsx";
import VitamineCard from "./VitamineCard.jsx";
import SearchInput from "../Inputs/SearchInput.jsx";
import { useContext } from "react";
import { UserContext } from "/src/Components/context/UserContext.jsx";
import {useNavigate} from "react-router-dom";

const VitaminsExhibit = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [vitamines, setVitamines] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchVitamines = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://api:3000/vitamines');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setVitamines(data);
            } catch (err) {
                setError(true);
                console.error('Erreur lors du fetch des vitamines:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVitamines();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const filteredVitamines = vitamines.filter((vitamine) =>
        vitamine.nom.replace("Vitamine ", "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Loading />;
    if (error) return <Error />;

    return (
        <div className="Vitamines">
            <SearchInput value={search} onChange={handleSearchChange} />
            <div className="vitaminesGallery">

                {user?
                    <div className="card" onClick={function (){
                        navigate("/VitamineCreator")


                    }}>
                       <b className={"vitamineName"}>+</b>

                        <p id={"description"} className="invisible">
                           Crée ta vitamine
                        </p>
                    </div>:""}

                {filteredVitamines.map((vitamine) => (
                    <VitamineCard
                        key={vitamine.id}
                        vitamine={vitamine}
                        cliquable={true}
                    />
                ))}
            </div>
        </div>

    );
};

export default VitaminsExhibit;
