import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './config/firebase'; // Firebase-Konfiguration importieren

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element nicht gefunden');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);