import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "setAiProvider(e.target.value as 'gemini' | 'openrouter');",
    "setAiProvider(e.target.value as 'gemini' | 'openrouter' | 'webllm' | 'anthropic' | 'openai');"
)
content = content.replace(
    """<option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                              </select>""",
    """<option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="webllm">WebLLM (Local Fallback)</option>
                                <option value="anthropic">Anthropic Claude</option>
                                <option value="openai">OpenAI</option>
                              </select>"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
