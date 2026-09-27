/**
 * Ollama Local / Termux Model Router Adapter
 */
export async function queryOllama(prompt, model = 'qwen3:0.6b', endpoint = 'http://127.0.0.1:11434') {
  const url = endpoint.replace(/\/$/, '') + '/api/generate';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  });
  if (!res.ok) throw new Error("Ollama error: " + res.statusText);
  const data = await res.json();
  return data.response;
}
