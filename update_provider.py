import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                              <select 
                                value={aiProvider} 
                                onChange={e => {
                                  setAiProvider(e.target.value as 'gemini' | 'openrouter');
                                  setShowModelDropdown(false);
                                  setModelSearch('');
                                }}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none flex-1"
                              >
                                <option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                              </select>"""

replacement = """                              <select 
                                value={aiProvider} 
                                onChange={e => {
                                  setAiProvider(e.target.value as 'gemini' | 'openrouter' | 'webllm');
                                  setShowModelDropdown(false);
                                  setModelSearch('');
                                }}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none flex-1"
                              >
                                <option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="webllm">WebLLM (Local Fallback)</option>
                              </select>"""

content = content.replace(target, replacement)
with open('src/App.tsx', 'w') as f:
    f.write(content)

