import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add states for HRE Copilot and Throughput Graph
hook_states = "  const [hreData, setHreData] = useState"
new_states = """  const [hreData, setHreData] = useState(Array.from({length: 20}, (_, i) => ({ time: i, ops: 0 })));
  const [hreChatHistory, setHreChatHistory] = useState<{role:string, content:string}[]>([]);
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
           memoryBank.record('SEMANTIC', { query: msg, response: res.text });
       }
    } catch(e) {
       console.error(e);
    }
  };

  useEffect(() => {
    if (!isHreConsoleOpen) return;
    const interval = setInterval(() => {
      setHreData(prev => {
        const next = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, ops: Math.floor(Math.random() * 100) }];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHreConsoleOpen]);
"""
if "const [hreChatHistory" not in content:
    content = content.replace("  const [isHreConsoleOpen, setIsHreConsoleOpen] = useState(false);", "  const [isHreConsoleOpen, setIsHreConsoleOpen] = useState(false);\n" + new_states)

# Replace the HRE terminal UI
search_terminal = """         <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-emerald-400 bg-black">
            <div>&gt; HRE Substrate Initialized</div>
            <div className="opacity-70">&gt; Awaiting executive payload...</div>
            <div className="opacity-70">&gt; Execution capability: SANDBOX</div>
         </div>"""

replace_terminal = """         <div className="flex-1 p-4 flex gap-4 overflow-hidden bg-black">
            <div className="w-1/2 h-full flex flex-col font-mono text-xs text-emerald-400 overflow-y-auto custom-scrollbar">
                <div>&gt; HRE Substrate Initialized</div>
                <div className="opacity-70">&gt; Awaiting executive payload...</div>
                <div className="opacity-70 mb-4">&gt; Execution capability: SANDBOX</div>
                
                {hreChatHistory.map((msg, i) => (
                   <div key={i} className="mb-2">
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
                </div>
            </div>
            <div className="w-1/2 h-full flex flex-col border-l border-emerald-900/50 pl-4">
                <div className="text-emerald-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Substrate Throughput & Stability</div>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hreData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                            <Line type="monotone" dataKey="ops" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </div>"""

if "HRE-COPILOT" not in content:
    content = content.replace(search_terminal, replace_terminal)

with open('src/App.tsx', 'w') as f:
    f.write(content)
