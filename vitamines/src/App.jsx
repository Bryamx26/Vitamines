import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from "./Components/Pages/Home.jsx";
import Header from "./Components/Layouts/Header.jsx";
import VitaminesDetails from "./Components/Vitamines/VitaminesDetails.jsx";
import Error from "./Components/Pages/Error.jsx";
import {Route, Routes} from "react-router-dom";
import "./Components/Pages/Login.jsx"
import Login from "./Components/Pages/Login.jsx";
import VitamineCreator from "./Components/Vitamines/VitamineCreator.jsx";
import VitamineEditor from "./Components/Vitamines/VitamineEditor.jsx";
import Register from "./Components/Pages/Register.jsx";

function App() {


  return (
    <>
        <Routes >
            <Route path="/" element={<Home/>} />
            <Route path="/vitamines/id/:id" element={<VitaminesDetails  />} />
            <Route path="/Login" element={<Login/>} />
            <Route path="/VitamineCreator/" element={<VitamineCreator  />} />
            <Route path="/VitamineEditor/:id" element={<VitamineEditor/>} />
            <Route path="/Register" element={<Register/>} />
            <Route path="*" element={<Error/>} />
        </Routes>

    </>
  )
}

export default App
