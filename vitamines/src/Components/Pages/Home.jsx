import Header from "../Layouts/Header.jsx";
import VitaminsExhibit from "../Vitamines/VitaminsExhibit.jsx";



function Home(){


    return (
        <>
            <Header />
            <main id="MainPage">



                <div className="Title">
                    <p>Vitamines</p>
                </div>
                <VitaminsExhibit/>
            </main>
        </>
    )
}

export default Home