import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
function QNAAppWrapper() {
  return /*#__PURE__*/React.createElement(App, null);
}
export function loadQNAApp(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    ReactDOM.render(/*#__PURE__*/React.createElement(QNAAppWrapper, null), container);
  }
}

// Expose the loadQNAApp function globally
window.loadQNAApp = loadQNAApp;