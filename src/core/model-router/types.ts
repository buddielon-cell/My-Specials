export type ProviderType = 'ollama' | 'gemini' | 'openrouter' | 'webllm' | 'anthropic';

export type TaskType = 
  | 'FAST_CHAT' 
  | 'GENERAL_REASONING' 
  | 'CODING' 
  | 'VISION' 
  | 'EMBEDDING' 
  | 'LONG_RESEARCH' 
  | 'OFFLINE' 
  | 'FALLBACK';

export interface ModelProfile {
  id: string;
  name: string;
  provider: ProviderType;
  contextWindow: number;
  capabilities: ('chat' | 'vision' | 'tools' | 'embedding')[];
  costPer1k: number; // 0 for local
}

export interface ProviderHealth {
  status: 'REAL' | 'SIMULATED' | 'UNAVAILABLE' | 'DEGRADED';
  latencyMs?: number;
  lastChecked: number;
  error?: string;
}

export interface RouterConfig {
  ollamaEndpoint: string;
  preferLocal: boolean;
  fallbackToLocal: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'model';
  content: string;
}

export interface GenerationResult {
  text: string;
  model: string;
  provider: ProviderType;
  durationMs: number;
  isFallback: boolean;
  error?: string;
}
