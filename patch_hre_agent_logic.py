import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I need to add state for hreChatHistory and an onKeyDown handler for the input.
state_hook = "  const [hreData, setHreData] = useState"
new_state = """  const [hreChatHistory, setHreChatHistory] = useState<{role:string, content:string}[]>([]);
  const [hreInput, setHreInput] = useState("");

  const submitHreCopilot = async () => {
    if (!hreInput.trim()) return;
    const msg = hreInput.trim();
    setHreInput("");
    setHreChatHistory(prev => [...prev, {role: 'user', content: msg}]);
    
    try {
       const res = await callAI(`You are HRE-COPILOT, an agentic AI built to co-work with the HBX Runtime Engine. You have access to persistent memory and RAG context. The user says: ${msg}`);
       if (res.ok) {
           setHreChatHistory(prev => [...prev, {role: 'assistant', content: res.text}]);
           // Simulate storing to persistent RAG memory
           memoryBank.record('SEMANTIC', { query: msg, response: res.text });
       }
    } catch(e) {
       console.error(e);
    }
  };
"""

if "const [hreChatHistory" not in content:
    content = content.replace(state_hook, new_state + state_hook)

# Replace the input element with a controlled one and add the chat log
search_ui = """                <div>&gt; HRE Substrate Initialized</div>
                <div>&gt; Awaiting tasks...</div>
                <div className="mt-auto border-t border-emerald-900/50 pt-2 flex items-center gap-2">
                   <span className="text-emerald-500 font-bold">HRE-COPILOT&gt;</span>
                   <input type="text" placeholder="Instruct HRE Copilot (RAG Memory Active)..." className="flex-1 bg-transparent border-none outline-none text-emerald-400 placeholder-emerald-900 font-mono text-xs" />
                </div>"""

replace_ui = """                <div>&gt; HRE Substrate Initialized</div>
                <div>&gt; HRE Copilot Online. RAG Memory Synced.</div>
                {hreChatHistory.map((msg, i) => (
                   <div key={i} className="mt-2">
                      <span className={msg.role === 'user' ? "text-slate-400" : "text-emerald-300"}>
                         {msg.role === 'user' ? "OPERATOR> " : "HRE-COPILOT> "}
                      </span>
                      <span className={msg.role === 'user' ? "text-slate-300" : "text-emerald-400"}>{msg.content}</span>
                   </div>
                ))}
                <div className="mt-auto border-t border-emerald-900/50 pt-2 flex items-center gap-2">
                   <span className="text-emerald-500 font-bold">HRE-COPILOT&gt;</span>
                   <input 
                      type="text" 
                      value={hreInput}
                      onChange={(e) => setHreInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitHreCopilot(); }}
                      placeholder="Instruct HRE Copilot (RAG Active)..." 
                      className="flex-1 bg-transparent border-none outline-none text-emerald-400 placeholder-emerald-900 font-mono text-xs" 
                   />
                </div>"""

if "HRE Copilot Online" not in content:
    content = content.replace(search_ui, replace_ui)

with open('src/App.tsx', 'w') as f:
    f.write(content)
