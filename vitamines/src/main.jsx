import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {UserProvider} from "./Components/context/UserContext.jsx";
import {ThemeContext, ThemeProvider} from "./Components/context/ThemeContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <UserProvider>
         <ThemeProvider>
              <BrowserRouter>
                 <App />
              </BrowserRouter>
         </ThemeProvider>
      </UserProvider>
  </StrictMode>,
)
