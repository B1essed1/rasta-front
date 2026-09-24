// Stylesheets first, in the design's exact cascade order (see design-src/dash.html).
// app2.css deliberately overrides app.css / dashboard.css — do not reorder.
import './styles/app.css';
import './styles/storefront.css';
import './styles/landing.css';
import './styles/marketplace.css';
import './styles/onboarding.css';
import './styles/dashboard-legacy.css';
import './styles/dashboard.css';
import './styles/app2.css';
// chat.css is NOT imported. It styles the design's in-chat ordering widget, and
// the Chats tab does not exist yet — but it redefines storefront classes
// (.opt-chip, .buy-box, .qty-pick, .sf-btn) at equal specificity and loads after
// storefront.css, which broke the product page size picker ("S0 items").
// Scope it under the chat root before importing it with ChatsView.
import './styles/bio.css';
import './styles/compat.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
