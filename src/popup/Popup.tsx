/**
 * Main popup component for the AutoGem Chrome extension.
 * Handles initialization, AI capability checking, and renders the UI.
 */
import React, { useEffect, useState } from 'react';

// Define the shape of our popup state
interface PopupState {
  isAIAvailable: boolean;  // Indicates if AI features are available
  stage: 'initial' | 'analyzing' | 'ready';  // Current stage of the popup
  modelStatus: string;  // Status message for the AI model
}

const Popup: React.FC = () => {
  const [state, setState] = useState<PopupState>({
    isAIAvailable: false,
    stage: 'initial',
    modelStatus: 'Checking capabilities...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage({ command: "check_capabilities" }, async (response) => {
      if (response.capabilities.isLanguageModelAvailable) {
        setState(prev => ({
          ...prev,
          isAIAvailable: true,
          stage: 'ready',
          modelStatus: 'AI model ready'
        }));
      } else {
        setState(prev => ({
          ...prev,
          modelStatus: 'AI features not available'
        }));
      }
      setLoading(false);
    });
  }, []); // Add an empty dependency array to ensure this runs only once

  if (loading) {
    return <div className="autogem-p-3">Loading...</div>;
  }

  return (
    <div className="autogem-w-80 autogem-p-4 autogem-bg-white">
      <Header />
      <StatusSection status={state} />
      <FeatureGuide />
      {!state.isAIAvailable && <AISetupGuide />}
    </div>
  );
};

/**
 * Header component displaying the extension logo and title
 */
const Header: React.FC = () => (
  <div className="autogem-flex autogem-items-center autogem-mb-4">
    <img 
      src="/images/icon-128.png" 
      alt="AutoGem" 
      className="autogem-w-8 autogem-h-8 autogem-mr-2"
    />
    <div>
      <h1 className="autogem-text-xl autogem-font-bold">AutoGem</h1>
      <p className="autogem-text-sm autogem-text-gray-600">Your AI Chat Assistant</p>
    </div>
  </div>
);

/**
 * Displays current AI status with visual indicators
 * @param status - Current state of the popup
 */
const StatusSection: React.FC<{ status: PopupState }> = ({ status }) => (
  <div className="autogem-mb-4 autogem-p-3 autogem-rounded-lg autogem-bg-gray-50">
    <h2 className="autogem-font-semibold autogem-mb-2">Status</h2>
    <div className={`autogem-flex autogem-items-center ${
      status.isAIAvailable ? 'autogem-text-green-600' : 'autogem-text-red-600'
    }`}>
      <span className="autogem-w-2 autogem-h-2 autogem-rounded-full autogem-mr-2 autogem-bg-current" />
      <span className="autogem-text-sm">{status.modelStatus}</span>
    </div>
  </div>
);

/**
 * Displays instructions on how to use the extension
 * Includes keyboard shortcuts and feature explanations
 */
const FeatureGuide: React.FC = () => (
  <div className="autogem-space-y-3">
    <h2 className="autogem-font-semibold">How It Works</h2>
    <div className="autogem-text-sm autogem-space-y-2">
      <p>1. AutoGem analyzes your chat conversation in real-time</p>
      <p>2. Initial suggestions appear after your first few messages</p>
      <p>3. More personalized suggestions as you continue chatting</p>
      <p>4. Press <kbd className="autogem-px-2 autogem-py-1 autogem-bg-gray-100 autogem-rounded">Ctrl/⌘ + Shift + U</kbd> to toggle suggestions</p>
    </div>
    <div className="autogem-mt-4 autogem-text-sm autogem-text-gray-600">
      <p>All processing happens locally on your device!</p>
    </div>
  </div>
);

/**
 * Shows setup instructions when AI features are not available
 * Provides links to Chrome flags and configuration steps
 */
const AISetupGuide: React.FC = () => (
  <div className="autogem-mt-4 autogem-p-3 autogem-bg-yellow-50 autogem-rounded-lg">
    <h2 className="autogem-font-semibold autogem-text-yellow-800 autogem-mb-2">
      Enable AI Features
    </h2>
    <ol className="autogem-text-sm autogem-space-y-2 autogem-text-yellow-800">
      <li>
        1. Open{' '}
        <button 
          className="autogem-text-blue-600 hover:autogem-underline"
          onClick={() => chrome.tabs.create({ url: 'chrome://flags/#prompt-api-for-gemini-nano' })}
        >
          Chrome AI Settings
        </button>
      </li>
      <li>2. Enable "Prompt API for Gemini Nano"</li>
      <li>3. Restart Chrome</li>
    </ol>
  </div>
);

export default Popup;