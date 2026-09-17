import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# For the main provider dropdown
target = """                                <option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="webllm">WebLLM (Local Fallback)</option>"""

replacement = """                                <option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="webllm">WebLLM (Local Fallback)</option>
                                <option value="anthropic">Anthropic Claude</option>
                                <option value="openai">OpenAI</option>"""

content = content.replace(target, replacement)

# For the AI provider state type definition
type_target = """const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter' | 'webllm'>('gemini');"""
type_replacement = """const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter' | 'webllm' | 'anthropic' | 'openai'>('gemini');"""
content = content.replace(type_target, type_replacement)

# And in the <select onChange>...
onchange_target = """setAiProvider(e.target.value as 'gemini' | 'openrouter' | 'webllm');"""
onchange_replacement = """setAiProvider(e.target.value as 'gemini' | 'openrouter' | 'webllm' | 'anthropic' | 'openai');"""
content = content.replace(onchange_target, onchange_replacement)


with open('src/App.tsx', 'w') as f:
    f.write(content)
