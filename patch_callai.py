import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We need to replace the body of callAI with one that uses modelRouter if provider is auto/routing, 
# but for now we can just leave callAI's signature and route it through modelRouter.
search_callAI = """  const callAI = async (promptText: string, contextVfs: any = null, history: any = [], provider = aiProvider, model = aiModel, customKey = customApiKey) => {
    try {
      if (useOfflineLlm || provider === 'webllm') {"""

replace_callAI = """  const callAI = async (promptText: string, contextVfs: any = null, history: any = [], provider = aiProvider, model = aiModel, customKey = customApiKey) => {
    try {
      // PHASE 1: Route through new Model Router if not specifically forcing a legacy path
      if (!useOfflineLlm && provider === 'gemini') {
         const msgs = [...history, { role: 'user', content: promptText }];
         const res = await modelRouter.generate('FAST_CHAT', msgs);
         if (!res.error) {
             return { ok: true, text: res.text, error: null };
         }
      }

      if (useOfflineLlm || provider === 'webllm') {"""

if search_callAI in content:
    content = content.replace(search_callAI, replace_callAI)
else:
    print("Could not find callAI")

with open('src/App.tsx', 'w') as f:
    f.write(content)
