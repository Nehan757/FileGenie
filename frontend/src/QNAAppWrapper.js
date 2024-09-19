import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function QNAAppWrapper() {
  return <App />;
}

export function loadQNAApp(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    ReactDOM.render(<QNAAppWrapper />, container);
  }
}

// Expose the loadQNAApp function globally
window.loadQNAApp = loadQNAApp;