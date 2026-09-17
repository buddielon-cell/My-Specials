import { ProviderHealth, ModelProfile } from './types';

export class OllamaProvider {
  private endpoint: string;

  constructor(endpoint: string = 'http://127.0.0.1:11434') {
    this.endpoint = endpoint.replace(/\/$/, '');
  }

  async healthCheck(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.endpoint}/api/tags`);
      if (res.ok) {
        return {
          status: 'REAL',
          latencyMs: Date.now() - start,
          lastChecked: Date.now()
        };
      }
      return { status: 'DEGRADED', error: 'Non-OK response', lastChecked: Date.now() };
    } catch (err: any) {
      return { status: 'UNAVAILABLE', error: err.message, lastChecked: Date.now() };
    }
  }

  async discoverModels(): Promise<ModelProfile[]> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.models || []).map((m: any) => ({
        id: m.name,
        name: m.name,
        provider: 'ollama',
        contextWindow: 8192, // Defaulting for Ollama
        capabilities: ['chat'], // simplified
        costPer1k: 0
      }));
    } catch {
      return [];
    }
  }

  async generate(model: string, prompt: string, system?: string): Promise<string> {
    const res = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json();
    return data.response;
  }
}
