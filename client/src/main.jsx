import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Set default base URL for axios
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

import "./i18n/i18n";
import LanguageProvider from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ModalProvider } from "./contexts/ModalContext";
import { AuthModalProvider } from "./contexts/AuthModalContext";
import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });



createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <AuthModalProvider>
            <StrictMode>
              <App />
            </StrictMode>
          </AuthModalProvider>
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  </LanguageProvider>,
)
