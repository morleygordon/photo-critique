import React from 'react';
import ReactDOM from 'react-dom/client';
import PhotoCritiqueApp from './App.jsx';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
  body {
    margin: 0; padding: 0; background: #0f1419; overscroll-behavior: none;
    padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);
  }
  * { -webkit-tap-highlight-color: transparent; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PhotoCritiqueApp />
  </React.StrictMode>
);
