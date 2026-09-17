import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add a simulated HRE throughput state
# Looking for a place to put `hreData` state.
hook = "  const [isHreConsoleOpen, setIsHreConsoleOpen] = useState(false);"
new_state = """  const [hreData, setHreData] = useState(Array.from({length: 20}, (_, i) => ({ time: i, ops: 0 })));

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
if "const [hreData, setHreData]" not in content:
    content = content.replace(hook, hook + "\n" + new_state)

# Add the graph to HRE terminal
search_terminal = """         <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-emerald-400 bg-black">
            <div>&gt; HRE Substrate Initialized</div>"""
replace_terminal = """         <div className="flex-1 p-4 flex gap-4 overflow-hidden bg-black">
            <div className="w-1/2 h-full flex flex-col font-mono text-xs text-emerald-400 overflow-y-auto custom-scrollbar">
                <div>&gt; HRE Substrate Initialized</div>
                <div>&gt; Awaiting tasks...</div>
            </div>
            <div className="w-1/2 h-full flex flex-col border-l border-emerald-900/50 pl-4">
                <div className="text-emerald-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Substrate Throughput</div>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hreData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                            <Line type="monotone" dataKey="ops" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>"""

if "<LineChart data={hreData}>" not in content:
    content = content.replace(search_terminal, replace_terminal)

# Add visual stepper for proposals
search_proposal = """                                  <div className="flex gap-2 text-xs">
                                    <span className="text-slate-400">{p.riskTier}</span>
                                    <span className={cn("px-2 py-0.5 rounded font-medium", p.status === 'DRAFT' ? "bg-slate-800 text-slate-300" : p.status === 'HUMAN_APPROVED' ? "bg-emerald-900/30 text-emerald-400" : "bg-blue-900/30 text-blue-400")}>{p.status}</span>
                                  </div>"""
replace_proposal = """                                  <div className="flex gap-2 text-xs mb-2">
                                    <span className="text-slate-400">{p.riskTier}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] font-bold">
                                     {['DRAFT', 'UNDER_REVIEW', 'HUMAN_APPROVED', 'IMPLEMENTED'].map((step, idx, arr) => {
                                        const currentIndex = arr.indexOf(p.status);
                                        const isPast = idx < currentIndex;
                                        const isCurrent = idx === currentIndex;
                                        return (
                                           <React.Fragment key={step}>
                                              <div className={cn("px-2 py-1 rounded border transition-colors", isPast ? "bg-emerald-900/40 text-emerald-500 border-emerald-900" : isCurrent ? "bg-blue-900/40 text-blue-400 border-blue-500/50" : "bg-slate-900 text-slate-600 border-slate-800")}>
                                                 {step}
                                              </div>
                                              {idx < arr.length - 1 && <div className={cn("w-3 h-px", isPast ? "bg-emerald-800" : "bg-slate-800")}></div>}
                                           </React.Fragment>
                                        );
                                     })}
                                  </div>"""
if "['DRAFT', 'UNDER_REVIEW', 'HUMAN_APPROVED', 'IMPLEMENTED']" not in content:
    content = content.replace(search_proposal, replace_proposal)

with open('src/App.tsx', 'w') as f:
    f.write(content)
