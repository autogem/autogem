import React, { useCallback, useEffect, useState, useRef } from "react";

/**
 * Message interface representing chat messages
 * @property text - The content of the message
 * @property timestamp - Unix timestamp of when the message was sent
 * @property isUser - Boolean flag indicating if message is from user
 */
interface Message {
  text: string;
  timestamp: number;
  isUser: boolean;
}

/**
 * Suggestion interface for AI-generated responses
 * @property text - The suggested response text
 * @property confidence - AI confidence score (0-1)
 * @property category - Type of suggestion (followUp/exploration/clarification)
 */
interface Suggestion {
  text: string;
  confidence: number;
  category: "followUp" | "exploration" | "clarification";
}

const CONFIDENCE_THRESHOLD = 0.85;

/**
 * AutoGem Content Component
 * 
 * A React component that provides intelligent conversation suggestions for Gemini chat.
 * Features:
 * - Real-time conversation monitoring
 * - AI-powered response suggestions
 * - Auto-response mode with confidence threshold
 * - Dark/Light theme support
 */
const Content: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [consecutiveHighConfidence, setConsecutiveHighConfidence] = useState(0);
  const previousMessagesRef = useRef<string>("");
  const [iconUrl, setIconUrl] = useState<string>("");

  /**
   * Extracts messages from Gemini chat DOM
   * @returns Array of Message objects
   */
  const extractMessagesFromGemini = useCallback((): Message[] => {
    const userQueries = document.querySelectorAll(
      "user-query-content .query-text"
    );

    const messages: Message[] = [];

    userQueries.forEach((query) => {
      const text = query.textContent?.trim();
      if (text) {
        messages.push({ text, timestamp: Date.now(), isUser: true });
      }
    });

    return messages;
  }, []);

  /**
   * Analyzes conversation using Chrome AI API
   * Triggers suggestions update and confidence metrics
   */
  const analyzeConversation = useCallback(async () => {
    if (!aiAvailable) {
      console.error("AI not available");
      return;
    }

    if (messages.length < 3) {
      console.log("Not enough messages for analysis");
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await chrome.runtime.sendMessage({
        command: "analyze_conversation",
        data: { messages, stage: "initial" },
      });

      if (response?.success) {
        setSuggestions(response.suggestions);
        updateConfidenceMetrics(response.suggestions);
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [messages, aiAvailable]);

  /**
   * Sets up mutation observer to watch for new messages
   * Debounced to prevent excessive API calls
   */
  const observeConversation = useCallback(() => {
    const observer = new MutationObserver(
      debounce(() => {
        const newMessages = extractMessagesFromGemini();
        const newMessagesString = JSON.stringify(newMessages);

        if (newMessagesString !== previousMessagesRef.current) {
          previousMessagesRef.current = newMessagesString;
          console.log("New messages detected:", newMessages);
          setMessages(newMessages);
          analyzeConversation();
        }
      }, 2000)
    );

    const chatContainer = document.querySelector(
      '[data-test-id="chat-history-container"]'
    );
    if (chatContainer) {
      observer.observe(chatContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => observer.disconnect();
  }, [extractMessagesFromGemini, analyzeConversation]);

  /**
   * Updates confidence metrics and manages auto-mode suggestions
   * @param newSuggestions - Array of new AI suggestions
   */
  const updateConfidenceMetrics = useCallback(
    (newSuggestions: Suggestion[]) => {
      const bestSuggestion = newSuggestions.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      setConfidenceScore(bestSuggestion.confidence);

      if (bestSuggestion.confidence > CONFIDENCE_THRESHOLD) {
        setConsecutiveHighConfidence((prev) => prev + 1);

        // Prompt user to activate auto-mode if confidence is high enough
        if (consecutiveHighConfidence >= 2 && !isAutoMode) {
          const shouldActivateAuto = window.confirm(
            "AutoGem has high confidence in predictions. Would you like to activate auto mode?"
          );
          if (shouldActivateAuto) {
            setIsAutoMode(true);
          }
        }
      } else {
        setConsecutiveHighConfidence(0);
      }
    },
    [consecutiveHighConfidence, isAutoMode]
  );

  /**
   * Automatically sends highest confidence suggestion if above threshold
   * Only active when auto-mode is enabled
   */
  const sendAutoResponse = useCallback(
    (suggestions: Suggestion[]) => {
      if (!isAutoMode) return;

      const bestSuggestion = suggestions.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      if (bestSuggestion.confidence > CONFIDENCE_THRESHOLD) {
        const input = document.querySelector('[contenteditable="true"]');
        if (input) {
          input.textContent = bestSuggestion.text;
          const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            which: 13,
            keyCode: 13,
            bubbles: true,
          });
          input.dispatchEvent(enterEvent);
        }
      } else {
        setIsAutoMode(false);
      }
    },
    [isAutoMode]
  );

  /**
   * Utility function to prevent excessive function calls
   * @param func - Function to debounce
   * @param wait - Delay in milliseconds
   */
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Effect Hooks Section
  /**
   * Initialize AI capabilities check
   */
  useEffect(() => {
    chrome.runtime.sendMessage(
      { command: "check_capabilities" },
      async (response) => {
        setAiAvailable(
          response?.capabilities?.isLanguageModelAvailable || false
        );
      }
    );
  }, []);

  /**
   * Setup conversation observer when component is visible
   */
  useEffect(() => {
    if (isVisible) {
      const cleanup = observeConversation();
      return () => cleanup();
    }
  }, [isVisible, observeConversation]);

  /**
   * Handle auto-response when new suggestions arrive
   */
  useEffect(() => {
    if (suggestions.length > 0 && isAutoMode) {
      sendAutoResponse(suggestions);
    }
  }, [suggestions, sendAutoResponse, isAutoMode]);

  useEffect(() => {
    const messageListener = (
      request: any,
      sender: any,
      sendResponse: (response?: any) => void
    ) => {
      if (request.command === "toggle_visibility") {
        setIsVisible((prev) => !prev);
        sendResponse({ success: true });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  useEffect(() => {
    const url = chrome.runtime.getURL("images/icon-128.png");
    console.log("Icon URL:", url);
    setIconUrl(url);
  }, []);

  if (!isVisible) return null;

  if (!aiAvailable) {
    return (
      <div className="autogem-fixed autogem-top-0 autogem-right-0 autogem-p-4 autogem-w-96">
        <div className="autogem-bg-red-50 autogem-border-l-4 autogem-border-red-500 autogem-p-4">
          <div className="autogem-flex">
            <div className="autogem-flex-shrink-0">
              <svg
                className="autogem-h-5 autogem-w-5 autogem-text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="autogem-ml-3">
              <h3 className="autogem-text-sm autogem-font-medium autogem-text-red-800">
                AI Features Not Available
              </h3>
              <div className="autogem-mt-2 autogem-text-sm autogem-text-red-700">
                <p>
                  Please enable Chrome AI features in settings and restart your
                  browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="autogem-fixed autogem-top-0 autogem-right-0  autogem-w-[400px]">
      <div className="autogem-bg-[#F8F9FA] dark:autogem-bg-[#202124] autogem-rounded-2xl autogem-shadow-lg">
        <div className="autogem-flex autogem-items-center autogem-justify-between autogem-p-4 autogem-border-b dark:autogem-border-gray-700">
          <div className="autogem-flex autogem-items-center">
            <img
              src={iconUrl}
              alt="AutoGem"
              className={`autogem-w-8 autogem-h-8 ${
                isAutoMode ? "autogem-animate-pulse" : ""
              }`}
            />
            <h3 className="autogem-text-lg autogem-font-semibold autogem-ml-2 dark:autogem-text-white">
              AutoGem {isAutoMode && "(Auto)"}
            </h3>
          </div>
          <div className="autogem-flex autogem-gap-2">
            {isAutoMode && (
              <button
                onClick={() => setIsAutoMode(false)}
                className="autogem-px-3 autogem-py-1.5 autogem-text-sm autogem-bg-red-500 autogem-text-white hover:autogem-bg-red-600 autogem-rounded-full autogem-cursor-pointer"
              >
                Stop Auto
              </button>
            )}
            <button
              onClick={analyzeConversation}
              className="autogem-px-3 autogem-py-1.5 autogem-text-sm autogem-text-white hover:autogem-bg-blue-300 dark:hover:autogem-bg-blue-600/50 autogem-rounded-full autogem-cursor-pointer"
              disabled={isAnalyzing}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="autogem-p-4 autogem-space-y-2">
          {isAnalyzing ? (
            <div className="autogem-flex autogem-items-center autogem-justify-center autogem-py-8">
              <div className="autogem-animate-spin autogem-h-5 autogem-w-5 autogem-border-2 autogem-border-blue-500 autogem-border-t-transparent autogem-rounded-full"></div>
              <span className="autogem-ml-2 autogem-text-gray-500 dark:autogem-text-gray-400">
                Analyzing...
              </span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="autogem-text-center autogem-text-gray-500 dark:autogem-text-gray-400 autogem-py-4">
              Keep chatting to see suggestions
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`
                  autogem-w-full autogem-text-left autogem-p-3 autogem-rounded
                  ${
                    suggestion.category === "followUp"
                      ? "autogem-bg-blue-500"
                      : suggestion.category === "exploration"
                      ? "autogem-bg-purple-500"
                      : "autogem-bg-green-500"
                  }
                  autogem-text-white
                  hover:autogem-opacity-90 autogem-transition-all
                `}
                onClick={() => {
                  const input = document.querySelector(
                    '[contenteditable="true"]'
                  );
                  if (input) {
                    input.textContent = suggestion.text;
                    (input as HTMLElement).focus();
                    const enterEvent = new KeyboardEvent("keydown", {
                      key: "Enter",
                      code: "Enter",
                      which: 13,
                      keyCode: 13,
                      bubbles: true,
                    });
                    input.dispatchEvent(enterEvent);
                  }
                }}
              >
                <div className="autogem-text-sm dark:autogem-text-white">
                  {suggestion.text}
                </div>
                <div className="autogem-mt-1 autogem-flex autogem-gap-2">
                  <span className="autogem-text-xs autogem-px-2 autogem-py-0.5 autogem-rounded-full autogem-bg-white/30 autogem-text-white dark:autogem-bg-white/30 dark:autogem-text-white">
                    {suggestion.category}
                  </span>
                  <span className="autogem-text-xs autogem-text-gray-500 dark:autogem-text-gray-400">
                    {(suggestion.confidence * 100).toFixed(0)}% match
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="autogem-p-3 autogem-border-t dark:autogem-border-gray-700">
          <div className="autogem-text-xs autogem-text-gray-500 dark:autogem-text-gray-400 autogem-text-center">
            {isAutoMode && (
              <div className="autogem-mb-1">
                Auto Mode Active - {(confidenceScore * 100).toFixed(0)}%
                confidence
              </div>
            )}
            Press Cmd/Ctrl + Shift + U to toggle
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
