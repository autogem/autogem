/**
 * Content Script Entry Point
 * This file is responsible for initializing and rendering the content script portion
 * of the Chrome extension into the active webpage.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Content from './Content';
import IsolatedStylesWrapper from './IsolatedStylesWrapper';

/**
 * Injects Quicksand Google Font into the webpage
 * This ensures our extension's UI maintains consistent typography
 */
const injectGoogleFonts = () => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// Initialize font resources
injectGoogleFonts();

/**
 * Create and inject the root element for our extension
 * Uses specific class names to ensure proper isolation from webpage styles
 */
const app = document.createElement('div');
app.id = 'autogem-content-root';
app.className = 'autogem-extension-root';
document.body.appendChild(app);

/**
 * Initialize React and render the content script
 * Wrapped in StrictMode for additional development checks
 * IsolatedStylesWrapper ensures our styles don't leak into the webpage
 */
const root = ReactDOM.createRoot(app);
root.render(
  <React.StrictMode>
    <IsolatedStylesWrapper>
      <Content />
    </IsolatedStylesWrapper>
  </React.StrictMode>
);