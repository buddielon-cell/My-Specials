import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

old_fallback = """      // Fallback to WebLLM on rate limit / 429 or explicit failure if desired, but for now we'll handle explicit provider.
      if (!res.ok && res.status === 429) {
        console.warn("Rate limited by cloud provider. Falling back to local WebLLM.");
        addTranscendenceEvent("CLOUD API LIMIT REACHED. Transmitting request to local browser-based WebLLM engine fallback...");
        const engine = await getWebLLMEngine();
        const reply = await engine.chat.completions.create({
          messages: [{ role: 'user', content: promptText }]
        });
        return { ok: true, text: reply.choices[0].message.content, error: null };
      }"""

new_fallback = """      // Fallback to WebLLM on rate limit / 429 or upstream provider errors.
      if (!res.ok && (res.status === 429 || res.status >= 500 || data.error?.includes('Upstream error') || data.error?.includes('Service temporarily overloaded'))) {
        console.warn("Cloud provider error or rate limit. Falling back to local WebLLM.", data.error);
        addTranscendenceEvent(`CLOUD API ERROR: ${data.error}. Transmitting request to local browser-based WebLLM engine fallback...`);
        try {
          const engine = await getWebLLMEngine();
          const reply = await engine.chat.completions.create({
            messages: [{ role: 'user', content: promptText }]
          });
          return { ok: true, text: reply.choices[0].message.content, error: null };
        } catch (e) {
          // If WebLLM fails too, return original error
          return { ok: false, text: null, error: data.error };
        }
      }"""

content = content.replace(old_fallback, new_fallback)

with open('src/App.tsx', 'w') as f:
    f.write(content)
