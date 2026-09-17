import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add a Copilot Chat input in the HRE console
# Search for HRE Substrate Initialized

search = """                <div>&gt; Awaiting tasks...</div>
            </div>
            <div className="w-1/2 h-full flex flex-col border-l border-emerald-900/50 pl-4">"""

replace = """                <div className="mt-auto border-t border-emerald-900/50 pt-2 flex items-center gap-2">
                   <span className="text-emerald-500 font-bold">HRE-COPILOT&gt;</span>
                   <input type="text" placeholder="Instruct HRE Copilot (RAG Memory Active)..." className="flex-1 bg-transparent border-none outline-none text-emerald-400 placeholder-emerald-900 font-mono text-xs" />
                </div>
            </div>
            <div className="w-1/2 h-full flex flex-col border-l border-emerald-900/50 pl-4">"""

if "HRE-COPILOT" not in content:
    content = content.replace(search, replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)
