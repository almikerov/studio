
export const AVAILABLE_MODELS = [
    'googleai/gemini-pro',
    'googleai/gemini-1.5-flash',
    'googleai/gemini-1.5-pro',
];

export type ApiKey = {
  id: string;
  key: string;
  isActive: boolean;
};

export type AiConfig = {
  apiKeys: ApiKey[];
  model: string;
};

const AI_CONFIG_KEY = 'geminiAiConfig';

export function getAiConfig(): AiConfig {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AiConfig;
      // Ensure model exists in the available list, otherwise default.
      if (!AVAILABLE_MODELS.includes(parsed.model)) {
          parsed.model = AVAILABLE_MODELS[0];
      }
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load AI config from localStorage", error);
  }
  // Return default config
  return {
    apiKeys: [],
    model: AVAILABLE_MODELS[0],
  };
}

export function saveAiConfig(config: AiConfig) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save AI config to localStorage", error);
  }
}
