import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n.tsx';
import axios from 'axios';

// Configure axios baseURL at runtime so the built frontend will call the correct
// backend path even if `VITE_API_URL` was not set at build time in Vercel.
const configuredBase = (import.meta.env.VITE_API_URL as string) || '';
if (configuredBase && !configuredBase.includes('localhost')) {
  axios.defaults.baseURL = configuredBase;
} else if (typeof window !== 'undefined') {
  // Use a relative path so the browser will call the same origin where the
  // site is hosted. Our Vercel rewrite maps `/api/*` to the backend.
  axios.defaults.baseURL = '/api';
} else {
  axios.defaults.baseURL = 'http://localhost:3001/api';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
);
