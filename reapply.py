import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add ResourceMonitor definition
resource_monitor = """
const ResourceMonitor = () => {
  const [cpu, setCpu] = React.useState(0);
  const [mem, setMem] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => {
        const target = Math.random() * 40 + 10;
        return Math.floor(prev + (target - prev) * 0.3);
      });
      setMem(prev => {
        const target = Math.random() * 50 + 30;
        return Math.floor(prev + (target - prev) * 0.1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-auto pt-4 border-t border-slate-800 p-4 shrink-0">
      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Workspace Resources</div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">CPU Usage</span>
            <span className={cpu > 40 ? "text-amber-400" : "text-emerald-400"}>{cpu}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 ${cpu > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${cpu}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Memory</span>
            <span className={mem > 70 ? "text-amber-400" : "text-emerald-400"}>{mem}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 ${mem > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${mem}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

content = content.replace("export default function App() {", resource_monitor + "\nexport default function App() {", 1)

# 2. Add ResourceMonitor invocation
search_sidebar_end = """                  )}
                </div>
                {/* End of Sidebar */}"""

replace_sidebar_end = """                  )}
                  <ResourceMonitor />
                </div>
                {/* End of Sidebar */}"""

if "<ResourceMonitor />" not in content:
    content = content.replace(search_sidebar_end, replace_sidebar_end)

# 3. Add History button and view
history_btn = """                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'history' ? "bg-slate-800 text-pink-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('history')}
                    >
                      <History className="w-3 h-3" /> History
                    </button>"""

if "activeTab === 'history'" not in content:
    content = content.replace("                      <Factory className=\"w-3 h-3\" /> Factory\n                    </button>", "                      <Factory className=\"w-3 h-3\" /> Factory\n                    </button>\n" + history_btn)

history_view = """                  ) : activeTab === 'history' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-pink-400 text-lg font-bold tracking-widest flex items-center gap-2"><History className="w-5 h-5"/> SYSTEM HISTORY & MEMORY</h2>
                        <div className="flex gap-2">
                           <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400">{history.length} Events</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {history.map((event, idx) => (
                           <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                              <div className="flex justify-between text-xs mb-2">
                                 <span className={event.role === 'user' ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'}>{event.role === 'user' ? 'OPERATOR' : 'SYSTEM'}</span>
                              </div>
                              <div className="text-slate-300 text-sm">{event.content}</div>
                           </div>
                        ))}
                      </div>
                    </div>"""

if "activeTab === 'history' ? (" not in content:
    content = content.replace("                  ) : activeTab === 'aeon' ? (", history_view + "\n                  ) : activeTab === 'aeon' ? (")


# 4. HRE Copilot updates
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


# 5. Keyboard shortcuts
shortcuts_logic = """
  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            setActiveTab('ai');
            setAiSubTab('chat');
            break;
          case 'b':
            e.preventDefault();
            setActiveTab('factory'); // or 'build', but factory is closest to build tools here
            break;
          case 'e':
            e.preventDefault();
            setActiveTab('aeon');
            break;
          case 'h':
            e.preventDefault();
            setActiveTab('history');
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
"""

if "window.addEventListener('keydown'" not in content:
    content = content.replace("  const saveFile = () => {", shortcuts_logic + "\n  const saveFile = () => {")


# 6. Proposal stepper patch
search_stepper = """                                  <div className="flex gap-2 text-xs">
                                    <span className="text-slate-400">{p.riskTier}</span>
                                    <span className={cn("px-2 py-0.5 rounded font-medium", p.status === 'DRAFT' ? "bg-slate-800 text-slate-300" : p.status === 'HUMAN_APPROVED' ? "bg-emerald-900/30 text-emerald-400" : "bg-blue-900/30 text-blue-400")}>{p.status}</span>
                                  </div>"""

replace_stepper = """                                  <div className="flex gap-2 text-xs mb-2">
                                    <span className="text-slate-400">{p.riskTier}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] font-bold">
                                     {['DRAFT', 'UNDER_REVIEW', 'AWAITING_HUMAN_APPROVAL', 'HUMAN_APPROVED'].map((step, idx, arr) => {
                                        const currentIndex = arr.indexOf(p.status);
                                        const isPast = idx < currentIndex;
                                        const isCurrent = idx === currentIndex;
                                        return (
                                           <React.Fragment key={step}>
                                              <div className={cn("px-2 py-1 rounded border transition-colors truncate max-w-[100px]", isPast ? "bg-emerald-900/40 text-emerald-500 border-emerald-900" : isCurrent ? "bg-blue-900/40 text-blue-400 border-blue-500/50" : "bg-slate-900 text-slate-600 border-slate-800")}>
                                                 {step.replace(/_/g, ' ')}
                                              </div>
                                              {idx < arr.length - 1 && <div className={cn("w-3 h-px shrink-0", isPast ? "bg-emerald-800" : "bg-slate-800")}></div>}
                                           </React.Fragment>
                                        );
                                     })}
                                  </div>"""

if "step.replace(/_/g" not in content:
    content = content.replace(search_stepper, replace_stepper)


with open('src/App.tsx', 'w') as f:
    f.write(content)
