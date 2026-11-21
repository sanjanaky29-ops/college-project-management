import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ensureSeed } from './services/storage.js';
import './styles.css';

// Make sure the demo admin/faculty accounts exist, then render.
ensureSeed().then(() => {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});
