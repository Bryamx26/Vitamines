import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {UserProvider} from "./Components/context/UserContext.jsx";
import {ThemeContext, ThemeProvider} from "./Components/context/ThemeContext.jsx";
import {APIProvider} from "./Components/context/APIContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <APIProvider>
      <UserProvider>
         <ThemeProvider>
              <BrowserRouter>
                 <App />
              </BrowserRouter>
         </ThemeProvider>
      </UserProvider>
      </APIProvider>
  </StrictMode>
)
