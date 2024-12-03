/**
 * Checks if AI functionality is available in the current environment
 * @returns {boolean} True if AI is available
 */
export const isLocalAiAvailable = () => 'ai' in self;

/**
 * Checks if the language model API is available
 * @returns {Promise<boolean>} Promise that resolves to true if language model is available
 */
export const isLanguageModelAvailable = async () => {
  return 'ai' in self && 'languageModel' in self.ai;
};

/** @type {AILanguageModel | null} Singleton instance of the language model */
let languageModel: AILanguageModel | null = null;

/**
 * Initializes the AI language model with default settings
 * @returns {Promise<AILanguageModel | null>} Initialized language model or null if initialization fails
 */
export const initLanguageModel = async () => {
  const isAvailable = await isLanguageModelAvailable();
  if (!isAvailable) return null;
  if (languageModel) return languageModel;

  try {
    const capabilities = await self.ai.languageModel.capabilities();
    languageModel = await self.ai.languageModel.create({
      temperature: 0.8,
      topK: capabilities.defaultTopK || undefined,
      systemPrompt: "You are a helpful assistant which helps users with their questions.",
    });
    return languageModel;
  } catch (error) {
    console.error("Error initializing language model:", error);
    return null;
  }
};

/**
 * Initializes all AI models
 * @returns {Promise<(AILanguageModel | null)[]>} Promise that resolves when all models are initialized
 */
export const initAllModels = () => Promise.all([initLanguageModel()]);

/**
 * Gets the initialized language model, attempting initialization if necessary
 * @returns {Promise<AILanguageModel | null>} Promise that resolves to the language model or null
 */
export const getLanguageModel = async () => {
  if (!languageModel) {
    try {
      await initLanguageModel();
    } catch (error) {
      console.error("Error getting language model:", error);
      return null;
    }
  }
  return languageModel;
};

