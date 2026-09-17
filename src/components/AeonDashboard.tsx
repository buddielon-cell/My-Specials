import React, { useState, useEffect } from 'react';
import { aeonBus, aeonCore, airsEngine, governanceEngine, hreEngine, memoryBank, AEONEvent } from '../engines/aeon';
import { cn } from '../lib/utils';
import { ShieldAlert, Cpu, Activity, Database, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function AeonDashboard({ onQuerySubmit }: { onQuerySubmit?: (q: string) => void }) {
  const [events, setEvents] = useState<AEONEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'aeon' | 'airs' | 'gov' | 'hre'>('aeon');
  const [tick, setTick] = useState(0);
  const [isHreActive, setIsHreActive] = useState(false);
  const [aeonQuery, setAeonQuery] = useState('');

  useEffect(() => {
    const sub = aeonBus.subscribe(ev => {
      setEvents(prev => [ev, ...prev].slice(0, 50));
      setTick(t => t + 1);
    });
    return () => sub();
  }, []);

  const initiateTest = () => {
    aeonCore.setObjective("Benchmark current planner and optimize");
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 text-sm overflow-hidden p-2 gap-4">
      {/* Top Banner */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg p-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-bold text-blue-400 text-base">AEON GOVERNED AUTONOMOUS BUILD SYSTEM</div>
          <div className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-800 rounded border border-slate-700">
            AEON CORE v2.0
          </div>
        </div>
        <div className="flex gap-2 items-center w-1/2">
          <input 
             type="text" 
             placeholder="Query AEON Executive Core..." 
             className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
             value={aeonQuery}
             onChange={e => setAeonQuery(e.target.value)}
             onKeyDown={e => {
                if (e.key === 'Enter' && aeonQuery.trim()) {
                   aeonCore.setObjective(aeonQuery);
                   if (onQuerySubmit) onQuerySubmit(aeonQuery);
                   setAeonQuery('');
                }
             }}
          />
          <button 
             onClick={() => {
                if (aeonQuery.trim()) {
                   aeonCore.setObjective(aeonQuery);
                   if (onQuerySubmit) onQuerySubmit(aeonQuery);
                   setAeonQuery('');
                }
             }} 
             className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold">Submit</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Modules */}
        <div className="w-2/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          
          <div className="flex gap-2 border-b border-slate-800 pb-2">
             <button onClick={() => setActiveTab('aeon')} className={cn("px-4 py-2 rounded text-xs font-bold transition-colors", activeTab === 'aeon' ? "bg-blue-900 text-blue-200" : "bg-slate-900 text-slate-400 hover:bg-slate-800")}><Cpu className="w-4 h-4 inline mr-1"/> AEON Executive</button>
             <button onClick={() => setActiveTab('airs')} className={cn("px-4 py-2 rounded text-xs font-bold transition-colors", activeTab === 'airs' ? "bg-purple-900 text-purple-200" : "bg-slate-900 text-slate-400 hover:bg-slate-800")}><Activity className="w-4 h-4 inline mr-1"/> AIRS Research</button>
             <button onClick={() => setActiveTab('gov')} className={cn("px-4 py-2 rounded text-xs font-bold transition-colors", activeTab === 'gov' ? "bg-amber-900 text-amber-200" : "bg-slate-900 text-slate-400 hover:bg-slate-800")}><ShieldAlert className="w-4 h-4 inline mr-1"/> GOVERNANCE</button>
             <button onClick={() => setActiveTab('hre')} className={cn("px-4 py-2 rounded text-xs font-bold transition-colors", activeTab === 'hre' ? "bg-emerald-900 text-emerald-200" : "bg-slate-900 text-slate-400 hover:bg-slate-800")}><Database className="w-4 h-4 inline mr-1"/> HRE Runtime</button>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col min-h-[400px]">
             {activeTab === 'aeon' && (
               <div>
                  <h3 className="text-blue-400 font-bold mb-4 text-xs tracking-wider">AEON EXECUTIVE CORE</h3>
                  <div className="space-y-4">
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Current State</div>
                        <div className="text-lg font-bold text-slate-200">{aeonCore.state}</div>
                     </div>
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Current Objective</div>
                        <div className="text-md text-slate-300">{aeonCore.objective || '--'}</div>
                     </div>
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Current Plan</div>
                        <div className="text-md text-slate-300">{aeonCore.plan || '--'}</div>
                     </div>
                  </div>
               </div>
             )}
             
             {activeTab === 'airs' && (
               <div>
                  <h3 className="text-purple-400 font-bold mb-4 text-xs tracking-wider">AIRS RESEARCH LAYER</h3>
                  <div className="space-y-2">
                     {airsEngine.experiments.map(exp => (
                        <div key={exp.id} className="bg-slate-950 p-3 rounded border border-slate-800">
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-200">{exp.id}</span>
                              <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", exp.status === 'running' ? "bg-blue-900 text-blue-300" : "bg-emerald-900 text-emerald-300")}>{exp.status}</span>
                           </div>
                           <div className="text-xs text-slate-400 mb-1"><span className="text-slate-500">Obj:</span> {exp.objective}</div>
                           <div className="text-xs text-slate-400 mb-2"><span className="text-slate-500">Hyp:</span> {exp.hypothesis}</div>
                           {exp.results && (
                             <div className="bg-purple-900/20 p-2 rounded border border-purple-800/30 text-purple-200 text-xs">
                                <strong>Finding:</strong> {exp.results.finding} (Conf: {exp.confidence})
                             </div>
                           )}
                        </div>
                     ))}
                     {airsEngine.experiments.length === 0 && <div className="text-slate-500 italic">No active experiments.</div>}
                  </div>
               </div>
             )}

             {activeTab === 'gov' && (
               <div>
                  <h3 className="text-amber-400 font-bold mb-4 text-xs tracking-wider">GOVERNANCE ENGINE</h3>
                  <div className="space-y-2">
                     {governanceEngine.proposals.map(prop => (
                        <div key={prop.id} className="bg-slate-950 p-3 rounded border border-slate-800">
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-amber-200">{prop.title}</span>
                              <div className="flex gap-2">
                                <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-[10px] font-bold">{prop.risk_level}</span>
                                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">{prop.governance_status}</span>
                              </div>
                           </div>
                           <div className="text-xs text-slate-400 mb-1"><span className="text-slate-500">Action:</span> {prop.recommended_action}</div>
                           <div className="text-xs text-slate-400"><span className="text-slate-500">Evidence attached:</span> {prop.evidence.length} items</div>
                        </div>
                     ))}
                     {governanceEngine.proposals.length === 0 && <div className="text-slate-500 italic">No proposals in queue.</div>}
                  </div>
               </div>
             )}

             {activeTab === 'hre' && (
               <div>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-emerald-400 font-bold text-xs tracking-wider">HBX RUNTIME ENGINE (HRE)</h3>
                     <button onClick={() => setIsHreActive(!isHreActive)} className={cn("px-3 py-1 text-xs font-bold rounded", isHreActive ? "bg-red-900/50 text-red-400 hover:bg-red-800" : "bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800")}>
                        {isHreActive ? 'Deactivate HRE' : 'Activate HRE'}
                     </button>
                  </div>
                  {isHreActive && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-2 rounded mb-4 text-xs text-emerald-200 flex items-center gap-2">
                       <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                       HRE is actively processing execution intent and connecting to external executors.
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-2">Capabilities</div>
                        <ul className="text-xs space-y-1 text-slate-400">
                           {Object.entries(hreEngine.capabilities).map(([k,v]) => (
                             <li key={k} className="flex justify-between"><span>{k}</span> <span className={cn(v === 'AVAILABLE' ? "text-emerald-400" : v === 'SANDBOX_ONLY' ? "text-amber-400" : "text-slate-500")}>{v}</span></li>
                           ))}
                        </ul>
                     </div>
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-2">Execution Receipts</div>
                        <div className="text-lg font-bold text-slate-200">{hreEngine.receipts.length}</div>
                     </div>
                  </div>

                  <div className="text-slate-500 text-[10px] uppercase mb-2">Execution Queue</div>
                  <div className="space-y-2">
                     {hreEngine.queue.map(act => (
                        <div key={act.action_id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                           <div>
                              <div className="font-bold text-slate-200 text-xs">{act.action_type}</div>
                              <div className="text-[10px] text-slate-500">{act.action_id} | {act.proposal_id}</div>
                           </div>
                           <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", act.status === 'completed' ? "bg-emerald-900 text-emerald-300" : act.status === 'executing' ? "bg-blue-900 text-blue-300 animate-pulse" : "bg-slate-800 text-slate-300")}>{act.status}</span>
                        </div>
                     ))}
                     {hreEngine.queue.length === 0 && <div className="text-slate-500 italic">Queue is empty.</div>}
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Event Log */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col min-h-[300px]">
              <div className="p-3 border-b border-slate-800 bg-slate-950 rounded-t-lg">
                <h3 className="text-slate-300 font-bold text-xs tracking-wider flex items-center gap-2"><Clock className="w-4 h-4"/> AEON AUDIT LEDGER</h3>
              </div>
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-2 text-xs">
                 {events.map(ev => (
                    <div key={ev.id} className="border-l-2 border-slate-700 pl-2 py-1 relative">
                       <div className="flex justify-between items-center mb-1">
                          <span className={cn("font-bold text-[10px]", 
                            ev.source === 'AEON' ? "text-blue-400" : 
                            ev.source === 'AIRS' ? "text-purple-400" : 
                            ev.source === 'GOVERNANCE' ? "text-amber-400" :
                            ev.source === 'HRE' ? "text-emerald-400" : "text-slate-500"
                          )}>{ev.source} | {ev.type}</span>
                       </div>
                       <div className="text-slate-400 text-[10px] font-mono break-all bg-slate-950 p-1 mt-1 rounded">
                         {JSON.stringify(ev.payload)}
                       </div>
                    </div>
                 ))}
                 {events.length === 0 && <div className="text-slate-600 italic">Awaiting events...</div>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
