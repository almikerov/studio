
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
      return JSON.parse(stored) as AiConfig;
    }
  } catch (error) {
    console.error("Failed to load AI config from localStorage", error);
  }
  // Return default config
  return {
    apiKeys: [],
    model: 'googleai/gemini-2.5-pro',
  };
}

export function saveAiConfig(config: AiConfig) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save AI config to localStorage", error);
  }
}
