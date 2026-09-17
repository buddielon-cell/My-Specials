import React, { useState } from 'react';
import { Network, Activity, Cpu, ShieldAlert, Zap, LayoutDashboard, Database, GitPullRequest, Search, CheckCircle, XCircle, Code, Layers, FileClock, ChevronLeft, ChevronRight, Menu, GitCommit, Undo2, TestTube, HardDrive, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function EvolutionEngine() {
  const [activeView, setActiveView] = useState<'architecture' | 'builder' | 'governance' | 'memory' | 'rollback'>('architecture');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [evolutionQuery, setEvolutionQuery] = useState('');
  const [pipelineState, setPipelineState] = useState<'idle' | 'research' | 'sandbox' | 'review' | 'governance' | 'hre' | 'complete'>('idle');

  const startEvolution = () => {
    if (!evolutionQuery) return;
    setPipelineState('research');
    
    // Simulate pipeline progression
    setTimeout(() => setPipelineState('sandbox'), 2000);
    setTimeout(() => setPipelineState('review'), 4000);
    setTimeout(() => setPipelineState('governance'), 6000);
  };

  const approveProposal = () => {
    setPipelineState('hre');
    setTimeout(() => setPipelineState('complete'), 3000);
  };

  const menuItems = [
    { id: 'architecture', label: 'Architecture Graph', icon: Layers, desc: 'Self-Inspection Engine' },
    { id: 'builder', label: 'Evolution Pipeline', icon: Cpu, desc: 'Internal Master Builder' },
    { id: 'governance', label: 'Governance Gates', icon: ShieldAlert, desc: 'Authorization & HRE' },
    { id: 'memory', label: 'Engineering Memory', icon: Database, desc: 'Knowledge & History' },
    { id: 'rollback', label: 'Rollback Manager', icon: Undo2, desc: 'Version Lineage & Snapshots' }
  ] as const;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300 overflow-hidden font-sans relative">
      
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-purple-900/50 p-4 shrink-0 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
               <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-purple-950 rounded-lg border border-purple-500/30 flex items-center justify-center">
                  <Network className="w-5 h-5 text-purple-400 animate-pulse" />
               </div>
               <div>
                  <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">AEON EVOLUTION ENGINE <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded text-[10px] uppercase">V3.0 DIRECTIVE ACTIVE</span></h1>
                  <div className="text-xs text-slate-500">Internal Master Builder • AIRS • Governed Change Control • HRE</div>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-3 bg-black border border-slate-800 rounded-lg p-2">
            <div className="flex flex-col text-right">
               <span className="text-[10px] text-slate-500 uppercase font-bold">System Health</span>
               <span className="text-xs text-emerald-400 font-bold">OPTIMAL</span>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="flex flex-col text-right">
               <span className="text-[10px] text-slate-500 uppercase font-bold">Autonomy Level</span>
               <span className="text-xs text-amber-400 font-bold">L4: GOVERNED DEPLOY</span>
            </div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
         
         {/* Collapsible Left Menu */}
         <div className={cn("bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300 overflow-hidden flex flex-col", isMenuOpen ? "w-64" : "w-0 border-none")}>
            <div className="p-4 border-b border-slate-800/50 bg-slate-950/30">
               <div className="text-xs font-bold text-slate-500 tracking-wider">ENGINEERING ORG</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
               {menuItems.map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn("w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors", activeView === item.id ? "bg-purple-900/30 border border-purple-500/30 text-purple-300" : "hover:bg-slate-800 text-slate-400")}
                 >
                    <item.icon className={cn("w-5 h-5 shrink-0", activeView === item.id ? "text-purple-400" : "text-slate-500")} />
                    <div className="flex flex-col min-w-0">
                       <span className="text-sm font-bold truncate">{item.label}</span>
                       <span className={cn("text-[10px] truncate", activeView === item.id ? "text-purple-400/70" : "text-slate-500")}>{item.desc}</span>
                    </div>
                 </button>
               ))}
            </div>
         </div>

         {/* MAIN CONTENT AREA */}
         <div className="flex-1 relative overflow-hidden bg-slate-950">
           
           {/* ARCHITECTURE VIEW */}
           {activeView === 'architecture' && (
             <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <div className="flex justify-between items-center mb-6">
                      <h2 className="text-purple-400 text-sm font-bold tracking-widest">AEON SYSTEM GRAPH (SELF-INTROSPECTION)</h2>
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white border border-slate-600 flex items-center gap-2">
                        <Search className="w-3 h-3"/> RUN INTROSPECTION SCAN
                      </button>
                   </div>
                   
                   <div className="flex flex-col items-center justify-center relative py-10 bg-black/40 rounded-xl border border-slate-800/50">
                      <div className="border border-indigo-500/30 bg-indigo-950/40 px-6 py-3 rounded-lg text-indigo-300 font-bold z-10 w-64 text-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">AEON Executive Core</div>
                      <div className="w-px h-8 bg-indigo-900/50"></div>
                      <div className="flex gap-8 relative">
                         <div className="absolute top-0 left-1/2 w-[600px] -translate-x-1/2 h-px bg-indigo-900/50"></div>
                         
                         <div className="flex flex-col items-center mt-6">
                            <div className="w-px h-6 bg-indigo-900/50 absolute -top-6"></div>
                            <div className="border border-blue-500/30 bg-blue-950/40 p-4 rounded-lg w-48 text-center hover:bg-blue-900/40 transition-colors cursor-pointer">
                               <div className="text-blue-400 font-bold mb-1 text-sm">AIRS</div>
                               <div className="text-xs text-slate-500">Research & Discovery</div>
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-center mt-6">
                            <div className="w-px h-6 bg-indigo-900/50 absolute -top-6"></div>
                            <div className="border border-emerald-500/30 bg-emerald-950/40 p-4 rounded-lg w-48 text-center hover:bg-emerald-900/40 transition-colors cursor-pointer">
                               <div className="text-emerald-400 font-bold mb-1 text-sm">Memory</div>
                               <div className="text-xs text-slate-500">Knowledge Layer</div>
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-center mt-6">
                            <div className="w-px h-6 bg-indigo-900/50 absolute -top-6"></div>
                            <div className="border border-amber-500/30 bg-amber-950/40 p-4 rounded-lg w-48 text-center hover:bg-amber-900/40 transition-colors cursor-pointer">
                               <div className="text-amber-400 font-bold mb-1 text-sm">Telemetry</div>
                               <div className="text-xs text-slate-500">Observability</div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="w-px h-12 bg-purple-900/50 mt-6 relative">
                         <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-slate-900 p-1 rounded-full border border-purple-500/30"><Search className="w-4 h-4 text-purple-400"/></div>
                      </div>
                      
                      <div className="border-2 border-purple-500/50 bg-purple-950/20 p-6 rounded-xl w-full max-w-4xl relative shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                         <div className="absolute -top-3 left-4 bg-slate-950 px-2 text-xs font-bold text-purple-400 border border-purple-500/30 rounded">EVOLUTION ENGINE (Internal Master Builder)</div>
                         <div className="grid grid-cols-4 gap-4">
                            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-lg text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                               <Search className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                               <div className="text-xs font-bold text-slate-300">Introspection</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-lg text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                               <Code className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                               <div className="text-xs font-bold text-slate-300">Code Builder</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-lg text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                               <LayoutDashboard className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                               <div className="text-xs font-bold text-slate-300">UI Builder</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-lg text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                               <TestTube className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                               <div className="text-xs font-bold text-slate-300">Test Engine</div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="w-px h-8 bg-red-900/50"></div>
                      <div className="border border-red-500/30 bg-red-950/40 px-6 py-3 rounded-lg text-red-300 font-bold z-10 w-64 text-center">Governance & Authorization</div>
                      <div className="w-px h-8 bg-emerald-900/50"></div>
                      <div className="border border-emerald-500/50 bg-emerald-900/20 px-6 py-3 rounded-lg text-emerald-400 font-mono font-bold z-10 w-64 text-center">HRE Execution Substrate</div>
                   </div>
                </div>
             </div>
           )}
           
           {/* BUILDER VIEW */}
           {activeView === 'builder' && (
             <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                 <h2 className="text-purple-400 text-sm font-bold tracking-widest flex items-center gap-2"><Zap className="w-4 h-4"/> REQUIREMENT ANALYZER</h2>
                 <p className="text-xs text-slate-400">Instruct AEON to build, modify, or extend its own architecture.</p>
                 <div className="flex gap-4">
                   <input 
                     type="text" 
                     value={evolutionQuery}
                     onChange={e => setEvolutionQuery(e.target.value)}
                     placeholder="e.g., Add a Photonics Research Laboratory module..." 
                     className="flex-1 bg-black border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
                     disabled={pipelineState !== 'idle'}
                   />
                   <button 
                     onClick={startEvolution}
                     disabled={pipelineState !== 'idle' || !evolutionQuery}
                     className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                   >
                     <Zap className="w-5 h-5"/> INITIATE BUILD
                   </button>
                 </div>
               </div>
               
               {pipelineState !== 'idle' && (
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <h2 className="text-purple-400 text-sm font-bold tracking-widest mb-6">AEON EVOLUTION PIPELINE</h2>
                   <div className="flex items-center justify-between relative px-10 mt-10 mb-8">
                      <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
                      
                      {[
                        { id: 'research', label: 'AIRS Research', icon: Search },
                        { id: 'sandbox', label: 'Build Sandbox', icon: Code },
                        { id: 'review', label: 'Adversarial', icon: ShieldAlert },
                        { id: 'governance', label: 'Governance', icon: GitPullRequest },
                        { id: 'hre', label: 'HRE Staging', icon: Database },
                        { id: 'complete', label: 'Promoted', icon: CheckCircle }
                      ].map((step, idx) => {
                         const states = ['idle', 'research', 'sandbox', 'review', 'governance', 'hre', 'complete'];
                         const currentIndex = states.indexOf(pipelineState);
                         const stepIndex = states.indexOf(step.id);
                         const isActive = stepIndex === currentIndex;
                         const isPast = stepIndex < currentIndex;
                         
                         return (
                           <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500", 
                                isPast ? "bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                                isActive ? "bg-purple-950 border-purple-400 text-purple-300 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110" : 
                                "bg-slate-900 border-slate-700 text-slate-500"
                              )}>
                                 <step.icon className="w-5 h-5" />
                              </div>
                              <div className={cn("text-[11px] font-bold absolute -bottom-7 whitespace-nowrap transition-colors", isActive ? "text-purple-400" : isPast ? "text-emerald-500" : "text-slate-600")}>
                                {step.label}
                              </div>
                           </div>
                         );
                      })}
                   </div>
                   
                   <div className="mt-12 bg-black border border-slate-800 rounded-lg p-5 font-mono text-xs text-slate-400 min-h-[180px] shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                      {pipelineState === 'research' && <div className="animate-in fade-in">&gt; AIRS investigating architectural constraints for: "{evolutionQuery}"...<br/>&gt; Identifying capability gaps via Architecture Graph...<br/>&gt; Generating implementation plan (REQ-001)...</div>}
                      {pipelineState === 'sandbox' && <div className="animate-in fade-in">&gt; IMPLEMENTATION PLAN AUTHORIZED.<br/>&gt; Generating UI components...<br/>&gt; Building internal data structures...<br/>&gt; Compiling inside isolated BUILD SANDBOX...<br/>&gt; Unit tests passing...</div>}
                      {pipelineState === 'review' && <div className="animate-in fade-in">&gt; Running continuous integration tests...<br/>&gt; Initiating Adversarial Security Review...<br/>&gt; Simulating attack vectors against proposed architecture...<br/><span className="text-emerald-400">&gt; Vulnerability scan: CLEAN</span></div>}
                      {pipelineState === 'governance' && <div className="animate-in fade-in">&gt; Build Candidate created: AEON vNEXT-CANDIDATE.<br/>&gt; Submitting PROPOSAL to Governance Engine...<br/><span className="text-amber-400 font-bold animate-pulse mt-2 inline-block">&gt; WAITING FOR HUMAN AUTHORIZATION (R3 LEVEL CHANGE)</span></div>}
                      {pipelineState === 'hre' && <div className="animate-in fade-in">&gt; AUTHORIZATION RECEIVED.<br/>&gt; HRE executing deployment to STAGING...<br/>&gt; Running integration validation...<br/>&gt; Verifying against Regression Suite...</div>}
                      {pipelineState === 'complete' && <div className="animate-in fade-in">&gt; Validation PASSED.<br/>&gt; Promoting change to PRODUCTION.<br/>&gt; Snapshot created (ROLLBACK REF: SNAP-8992). Memory updated.<br/><span className="text-emerald-400 font-bold text-sm mt-2 inline-block">&gt; EVOLUTION COMPLETE.</span></div>}
                   </div>
                   
                   {pipelineState === 'governance' && (
                     <div className="mt-6 flex justify-end gap-3 animate-in fade-in slide-in-from-right-8">
                       <button onClick={() => setPipelineState('idle')} className="px-5 py-2 border border-slate-600 hover:bg-slate-800 text-white rounded font-medium transition-colors">REJECT & ROLLBACK</button>
                       <button onClick={approveProposal} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-colors"><CheckCircle className="w-5 h-5"/> AUTHORIZE HRE EXECUTION</button>
                     </div>
                   )}
                 </div>
               )}
             </div>
           )}
           
           {/* GOVERNANCE VIEW */}
           {activeView === 'governance' && (
             <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <h2 className="text-purple-400 text-sm font-bold tracking-widest mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> GOVERNANCE & AUTHORIZATION GATES</h2>
                   <p className="text-xs text-slate-400 mb-6 border-b border-slate-800 pb-4">Internal Master Builder modifications classified as R3 or higher require explicit human override before HRE executes.</p>
                   
                   <div className="space-y-4">
                      <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-5 flex gap-5 shadow-lg shadow-amber-900/10">
                         <div className="w-12 h-12 bg-amber-950 rounded-full flex items-center justify-center shrink-0 border border-amber-500/50 relative">
                            <ShieldAlert className="w-6 h-6 text-amber-400" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></span>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></span>
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <h3 className="font-bold text-slate-100 text-lg">PROP-042: Implement Autonomous Code Correction Loop</h3>
                                  <span className="text-xs text-slate-500 font-mono">ID: a3f9b2c • Requires: EXECUTIVE_OVERRIDE</span>
                               </div>
                               <span className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-500/50 rounded flex items-center gap-1 text-xs font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                  <AlertCircle className="w-3 h-3" /> R4: CRITICAL
                               </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                               Allows AEON to automatically diagnose and rebuild failed components up to 5 times before halting. Modifies core HRE execution limits.
                            </p>
                            <div className="flex gap-3">
                               <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                  <CheckCircle className="w-4 h-4"/> AUTHORIZE
                               </button>
                               <button className="px-4 py-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700 hover:border-red-900">
                                  <XCircle className="w-4 h-4"/> DENY
                               </button>
                               <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700">
                                  <FileText className="w-4 h-4"/> VIEW DIFF
                               </button>
                            </div>
                         </div>
                      </div>
                      
                      <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-5 flex gap-5 opacity-60 hover:opacity-100 transition-opacity">
                         <div className="w-12 h-12 bg-emerald-950 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <h3 className="font-bold text-slate-300">PROP-041: Add News Ticker to App Foundation</h3>
                                  <span className="text-xs text-slate-500 font-mono">ID: 8d2e1a9 • Executed: 2 hours ago</span>
                               </div>
                               <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold">R1: SANDBOX</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">Implemented News Ticker fetching via Firebase HN API as per operator instruction.</p>
                            <div className="text-xs text-emerald-500 font-bold tracking-widest flex items-center gap-1">
                               <CheckCircle2 className="w-3 h-3"/> PROMOTED BY HRE
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* MEMORY VIEW */}
           {activeView === 'memory' && (
             <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <h2 className="text-purple-400 text-sm font-bold tracking-widest mb-6 flex items-center gap-2"><Database className="w-4 h-4"/> ENGINEERING MEMORY & LESSONS</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                         <div className="text-xs text-slate-500 font-bold mb-2">LESSON RECORDED</div>
                         <div className="text-sm text-slate-300 mb-3">"Direct array mutation in React state freezes execution. Use immutable spreads."</div>
                         <div className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Validated 1 hour ago</div>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                         <div className="text-xs text-slate-500 font-bold mb-2">ARCHITECTURAL DECISION</div>
                         <div className="text-sm text-slate-300 mb-3">"WebLLM Cache API blocked in sandboxed iframes. Implemented Termux local fallback via REST."</div>
                         <div className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Validated 3 hours ago</div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* ROLLBACK VIEW */}
           {activeView === 'rollback' && (
             <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                   <h2 className="text-purple-400 text-sm font-bold tracking-widest mb-6 flex items-center gap-2"><Undo2 className="w-4 h-4"/> VERSION LINEAGE & ROLLBACK</h2>
                   
                   <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 py-2">
                      
                      <div className="relative pl-6">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900"></div>
                         <h3 className="text-sm font-bold text-white flex items-center gap-2">AEON v3.0.2 <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[10px] uppercase">CURRENT LIVE</span></h3>
                         <div className="text-xs text-slate-500 mt-1">Snapshot: SNAP-8993 • Author: Internal Builder</div>
                         <p className="text-sm text-slate-400 mt-2">Added Evolutionary Engine UI and Collapsible Menu System.</p>
                      </div>

                      <div className="relative pl-6 opacity-60 hover:opacity-100 transition-opacity">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-500 border-4 border-slate-900"></div>
                         <h3 className="text-sm font-bold text-slate-300">AEON v3.0.1</h3>
                         <div className="text-xs text-slate-500 mt-1">Snapshot: SNAP-8992 • Author: Internal Builder</div>
                         <p className="text-sm text-slate-400 mt-2">Fixed AdvancedFactory engine mutations and WebLLM sandbox blocks.</p>
                         <button className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-amber-900/50 hover:text-amber-400 text-slate-300 text-xs font-bold rounded border border-slate-700 transition-colors">
                           ROLLBACK TO THIS VERSION
                         </button>
                      </div>
                      
                      <div className="relative pl-6 opacity-60 hover:opacity-100 transition-opacity">
                         <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-500 border-4 border-slate-900"></div>
                         <h3 className="text-sm font-bold text-slate-300">AEON v2.9.0</h3>
                         <div className="text-xs text-slate-500 mt-1">Snapshot: SNAP-8980 • Author: Operator</div>
                         <p className="text-sm text-slate-400 mt-2">Initial Factory Simulation implementation.</p>
                         <button className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-amber-900/50 hover:text-amber-400 text-slate-300 text-xs font-bold rounded border border-slate-700 transition-colors">
                           ROLLBACK TO THIS VERSION
                         </button>
                      </div>

                   </div>
                </div>
             </div>
           )}

         </div>
      </div>
    </div>
  );
}
