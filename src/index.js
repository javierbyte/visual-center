import './style.css';

import '../node_modules/jbx/dist/main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
