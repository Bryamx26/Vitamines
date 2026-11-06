import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./Components/context/UserContext.jsx";
import { ThemeProvider } from "./Components/context/ThemeContext.jsx";
import { APIProvider } from "./Components/context/APIContext.jsx";
import { NotificationProvider } from "./Components/context/NotificationContext.jsx";

createRoot(document.getElementById('root')).render(
   <StrictMode>
      <NotificationProvider>
         <APIProvider>
            <UserProvider>
               <ThemeProvider>
                  <BrowserRouter>
                     <App />
                  </BrowserRouter>
               </ThemeProvider>
            </UserProvider>
         </APIProvider>
      </NotificationProvider>
   </StrictMode>
)
