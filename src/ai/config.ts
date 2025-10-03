
export type ApiKey = {
  id: string;
  key: string;
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
      // Migration: Remove isActive property if it exists
      const parsed = JSON.parse(stored) as AiConfig & { apiKeys: (ApiKey & { isActive?: boolean })[] };
      if (parsed.apiKeys.some(k => 'isActive' in k)) {
        parsed.apiKeys.forEach(k => delete k.isActive);
      }
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load AI config from localStorage", error);
  }
  // Return default config
  return {
    apiKeys: [],
    model: 'gemini-2.5-light',
  };
}

export function saveAiConfig(config: AiConfig) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save AI config to localStorage", error);
  }
}
