import { CreateMLCEngine, InitProgressReport, MLCEngineInterface } from '@mlc-ai/web-llm';

let engine: MLCEngineInterface | null = null;
let initPromise: Promise<MLCEngineInterface> | null = null;

export async function getWebLLMEngine(onProgress?: (progress: InitProgressReport) => void) {
  if (engine) return engine;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC";
      engine = await CreateMLCEngine(
        selectedModel,
        { initProgressCallback: onProgress }
      );
      return engine;
    } catch (e: any) {
      console.error("WebLLM Init Error:", e);
      // We throw a clean error so the UI can gracefully fallback to the local API or show an error
      throw new Error("Browser Cache/Network Error: " + e.message + ". Please use the Local REST API (Termux) option.");
    }
  })();
  
  return initPromise;
}
