import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { OfflineProvider } from './offline/OfflineContext.jsx';

// Self-hosted fonts (offline-safe — no fonts.googleapis.com / fonts.gstatic.com
// calls). Files are installed locally into node_modules by `npm install`,
// per the offline requirements doc, section 3 & 11.
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/500.css';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <OfflineProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </OfflineProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
