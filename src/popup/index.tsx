/**
 * Entry point for the Chrome extension popup
 * This file handles the initialization and rendering of the popup UI
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './../tailwind.css';
import Popup from './Popup';

// Get root element for React mounting
const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

// Apply extension-specific className to prevent style conflicts
root.className = "autogem-extension-popup";

// Initialize React root and render the Popup component
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);