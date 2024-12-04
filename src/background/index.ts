/**
 * Background Script for AutoGem Extension
 * 
 * This script handles the core functionality of the extension including:
 * - Message processing between content script and extension
 * - AI-powered question generation
 * - Extension capability checks
 * - Keyboard shortcut handling
 */

import { getLanguageModel, initAllModels, isLanguageModelAvailable } from "./ai";

/**
 * Represents a chat message in the conversation
 * @interface Message
 * @property {string} text - The content of the message
 * @property {number} timestamp - Unix timestamp of when the message was sent
 * @property {boolean} isUser - Whether the message was sent by the user
 */
export interface Message {
  text: string;
  timestamp: number;
  isUser: boolean;
}

/**
 * Generates follow-up, exploration and clarification questions based on conversation history
 * @param messages - Array of conversation messages
 * @returns Object containing success status and either suggestions or error
 */
async function generateQuestions(messages: Message[]) {
  const languageModel = await getLanguageModel();
  if (!languageModel) return { success: false, error: "Language model not available" };

  const recentMessages = messages.length > 10 ? messages.slice(-10) : messages;
  const prompt = `Analyze this conversation and generate follow-up questions in JSON format.

Context: ${recentMessages.filter(m => m.isUser).map(m => `User: ${m.text}`).join('\n')}

Generate 3 questions that a user might naturally ask next. For each question, assess its relevance and provide:
1. A natural follow-up question
2. A confidence score (0-1) based on how well it fits the context
3. A category: "followUp" for direct questions about the last response, "exploration" for related topics, or "clarification" for seeking more details

Return only a JSON array in this exact format:
[
  {
    "text": "question text",
    "confidence": number,
    "category": "followUp" | "exploration" | "clarification"
  }
]`;

  try {
    const response = await languageModel.prompt(prompt);
    const suggestions = JSON.parse(response);

    if (!Array.isArray(suggestions)) {
      throw new Error("Invalid response format");
    }

    return { success: true, suggestions };
  } catch (error: any) {
    console.error("Question generation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Message handler for extension communications
 * Handles commands:
 * - analyze_conversation: Generates questions from chat history
 * - check_capabilities: Checks AI model availability
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.command) {
    case "analyze_conversation": {
      if (!message.data?.messages) {
        sendResponse({ success: false, error: "Invalid data" });
        return;
      }
      if(message.data?.messages.length === 0){
        sendResponse({ success: false, error: "Invalid data" });
        return;
      }
      (async () => {
        try {
          const result = await generateQuestions(message.data.messages);
          sendResponse(result);
        } catch (error) {
          sendResponse({ success: false, error: (error as Error).message });
        }
      })();

      return true;
    }

    case "check_capabilities": {
      (async () => {
        const capabilities = {
          isLanguageModelAvailable: await isLanguageModelAvailable()
        };
        sendResponse({ capabilities });
      })();
      return true;
    }
  }
});

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  initAllModels();
});

/**
 * Keyboard shortcut handler
 * Command 'activate': Toggles the extension UI visibility
 */
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "activate") {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { command: "toggle_visibility" });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
});