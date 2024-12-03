/**
 * IsolatedStylesWrapper Component
 * 
 * A wrapper component that provides style isolation for the Autogem extension content.
 * This prevents styles from the host page affecting the extension's UI components.
 * 
 * Features:
 * - Applies Tailwind CSS styles only to extension components
 * - Resets border styles to prevent inheritance
 * - Sets consistent typography using custom Autogem font classes
 * 
 * @component
 * @param {React.PropsWithChildren} props - Child components to be wrapped
 * @returns {React.ReactElement} Wrapped children with isolated styles
 */

import React from 'react';
import '../tailwind.css';

const IsolatedStylesWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="autogem-extension-root">
      {/* Style reset and base typography configuration */}
      <style>{`
        /* Reset border styles for root and all child elements */
        .autogem-extension-root,
        .autogem-extension-root * {
          border-width: 0;
        }
        /* Apply base typography styles */
        .autogem-extension-root {
          @apply autogem-font-sans autogem-text-base autogem-leading-normal;
        }
      `}</style>
      {children}
    </div>
  );
};

export default IsolatedStylesWrapper;