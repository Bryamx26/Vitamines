import Header from "../Layouts/Header.jsx";

function Error() {



    return (

        <div style= {{backgroundColor : "rgba(255,0,0,0.59)" } } id={"MainPage"}>
        <Header />
        <p style={{color :'#000000' , marginTop : "5rem" }}>Une erreur est survenue, veuiller verifier le chemin...</p>
        </div>
    )
}

export default Error;