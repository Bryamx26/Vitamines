import './App.css'
import Home from "./Components/Pages/Home.jsx";
import Header from "./Components/Layouts/Header.jsx";
import VitaminesDetails from "./Components/Vitamines/VitaminesDetails.jsx";
import Error from "./Components/Pages/Error.jsx";
import { Route, Routes } from "react-router-dom";
import "./Components/Pages/Login.jsx"
import Login from "./Components/Pages/Login.jsx";
import VitamineCreator from "./Components/Vitamines/VitamineCreator.jsx";
import VitamineEditor from "./Components/Vitamines/VitamineEditor.jsx";
import Register from "./Components/Pages/Register.jsx";
import About from "./Components/Pages/About.jsx";
import Contact from "./Components/Pages/Contact.jsx";
import QuizzPage from "./Components/Quizz/QuizzPage.jsx";
import QuizzAdmin from "./Components/Quizz/QuizzAdmin.jsx";
import QuizzEditor from "./Components/Quizz/QuizzEditor.jsx";
import Profil from "./Components/Pages/Profil.jsx";
import MentionsLegales from "./Components/Legal/MentionsLegales.jsx";
import Confidentialite from "./Components/Legal/Confidentialite.jsx";
import AvertissementSante from "./Components/Legal/AvertissementSante.jsx";
import Sources from "./Components/Legal/Sources.jsx";

function App() {


  return (
    <>
      <Routes >
        <Route path="/" element={<Home />} />
        <Route path="/vitamines/id/:id" element={<VitaminesDetails />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/VitamineCreator/" element={<VitamineCreator />} />
        <Route path="/VitamineEditor/:id" element={<VitamineEditor />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/quiz" element={<QuizzPage />} />
        <Route path="/quiz/gestion" element={<QuizzAdmin />} />
        <Route path="/quiz/creer" element={<QuizzEditor />} />
        <Route path="/quiz/:id/modifier" element={<QuizzEditor />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/avertissement-sante" element={<AvertissementSante />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="*" element={<Error />} />
      </Routes>

    </>
  )
}

export default App
