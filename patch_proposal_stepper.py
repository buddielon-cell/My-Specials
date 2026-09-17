import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

search = """                                  <div className="flex gap-2 text-xs">
                                    <span className="text-slate-400">{p.riskTier}</span>
                                    <span className={cn("px-2 py-0.5 rounded font-medium", p.status === 'DRAFT' ? "bg-slate-800 text-slate-300" : p.status === 'HUMAN_APPROVED' ? "bg-emerald-900/30 text-emerald-400" : "bg-blue-900/30 text-blue-400")}>{p.status}</span>
                                  </div>"""

replace = """                                  <div className="flex gap-2 text-xs mb-2">
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
    content = content.replace(search, replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)
