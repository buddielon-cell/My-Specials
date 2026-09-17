import { ProviderType, TaskType, ModelProfile, ProviderHealth, GenerationResult, ChatMessage } from './types';
import { OllamaProvider } from './ollama';

export class ModelRouter {
  private ollama: OllamaProvider;
  private ollamaModels: ModelProfile[] = [];
  public health: Record<ProviderType, ProviderHealth> = {
    ollama: { status: 'UNAVAILABLE', lastChecked: 0 },
    gemini: { status: 'REAL', lastChecked: Date.now() }, // Cloud fallback
    openrouter: { status: 'UNAVAILABLE', lastChecked: 0 },
    webllm: { status: 'UNAVAILABLE', lastChecked: 0 },
    anthropic: { status: 'UNAVAILABLE', lastChecked: 0 }
  };

  constructor() {
    this.ollama = new OllamaProvider();
  }

  async initialize() {
    this.health.ollama = await this.ollama.healthCheck();
    if (this.health.ollama.status === 'REAL') {
      this.ollamaModels = await this.ollama.discoverModels();
    }
  }

  async selectModel(task: TaskType): Promise<{ provider: ProviderType; model: string }> {
    // Refresh local health quickly
    if (Date.now() - this.health.ollama.lastChecked > 60000) {
      await this.initialize();
    }

    const hasOllama = this.health.ollama.status === 'REAL' && this.ollamaModels.length > 0;
    
    switch (task) {
      case 'FAST_CHAT':
        if (hasOllama) {
          // Find phi3.5 or qwen
          const fastModel = this.ollamaModels.find(m => m.id.includes('phi') || m.id.includes('qwen') || m.id.includes('llama3'));
          if (fastModel) return { provider: 'ollama', model: fastModel.id };
          return { provider: 'ollama', model: this.ollamaModels[0].id };
        }
        return { provider: 'gemini', model: 'gemini-3.7-flash' };
        
      case 'GENERAL_REASONING':
      case 'CODING':
      case 'LONG_RESEARCH':
        // Default to cloud for complex tasks unless offline
        return { provider: 'gemini', model: 'gemini-3.7-pro' }; // Or flash
        
      case 'OFFLINE':
        if (hasOllama) return { provider: 'ollama', model: this.ollamaModels[0].id };
        return { provider: 'webllm', model: 'local-model' };
        
      default:
        return { provider: 'gemini', model: 'gemini-3.7-flash' };
    }
  }

  async generate(task: TaskType, messages: ChatMessage[]): Promise<GenerationResult> {
    const start = Date.now();
    let selection = await this.selectModel(task);
    let isFallback = false;

    // Format prompt from messages
    const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const systemMsg = messages.find(m => m.role === 'system')?.content;

    try {
      let text = '';
      if (selection.provider === 'ollama') {
        text = await this.ollama.generate(selection.model, prompt, systemMsg);
      } else {
        // Fallback to cloud API
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             prompt, 
             chatHistory: messages, 
             provider: selection.provider, 
             model: selection.model 
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Cloud API failed');
        text = data.text;
      }

      return {
        text,
        model: selection.model,
        provider: selection.provider,
        durationMs: Date.now() - start,
        isFallback
      };
    } catch (err: any) {
      console.warn(`[ModelRouter] Primary provider ${selection.provider} failed: ${err.message}. Attempting fallback.`);
      isFallback = true;
      
      // Fallback to WebLLM or generic API
      try {
         const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, chatHistory: messages, provider: 'gemini', model: 'gemini-3.7-flash' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return {
          text: data.text,
          model: 'gemini-3.7-flash',
          provider: 'gemini',
          durationMs: Date.now() - start,
          isFallback: true
        };
      } catch (fallbackErr: any) {
        return {
          text: '',
          model: selection.model,
          provider: selection.provider,
          durationMs: Date.now() - start,
          isFallback: true,
          error: `Primary: ${err.message}. Fallback: ${fallbackErr.message}`
        };
      }
    }
  }
}

export const modelRouter = new ModelRouter();
// Initialize eagerly
modelRouter.initialize().catch(console.error);
