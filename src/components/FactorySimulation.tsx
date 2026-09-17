import React, { useState, useEffect } from 'react';
import { MachineControlPanel } from './MachineControlPanel';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { advancedFactoryEngine, MachineState, AdvancedMachine, GarmentTwin, FactoryEvent } from '../engines/advancedFactory';
import { Play, Pause, CheckCircle, RotateCcw, AlertTriangle, Settings, Activity, ServerCrash, Wrench, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';


  const getMachineClass = (m: AdvancedMachine, viewMode: string) => {
    if (m.state === 'FAULT') return "border-red-500 bg-red-950/50";
    if (viewMode === 'efficiency') {
       const u = m.utilization || 0;
       if (u >= 80) return "border-emerald-500/70 bg-emerald-950/40";
       if (u >= 40) return "border-amber-500/70 bg-amber-950/40";
       return "border-red-500/70 bg-red-950/40";
    }
    if (m.state === 'COMPLETED') return "border-emerald-400 bg-emerald-900/40";
    if (m.state === 'RUNNING') return "border-emerald-500/50 bg-emerald-950/20";
    return "border-slate-700 bg-slate-800/50";
  };

const StateColor = {
  'IDLE': 'bg-slate-500',
  'QUEUED': 'bg-blue-400',
  'PREPARING': 'bg-amber-400',
  'RUNNING': 'bg-emerald-500',
  'PAUSED': 'bg-slate-400',
  'QUALITY_CHECK': 'bg-indigo-400',
  'MAINTENANCE': 'bg-orange-500',
  'FAULT': 'bg-red-500',
  'OFFLINE': 'bg-red-800',
  'COMPLETED': 'bg-purple-500'
};

export default function FactorySimulation() {
  const [tick, setTick] = useState(0);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'status'|'efficiency'>('status');
  
  useEffect(() => {
    const unsubscribe = advancedFactoryEngine.subscribe(() => setTick(t => t + 1));
  
  const wipCount = e.garments.filter(g => g.stage !== 'COMPLETED').length;
  const qaCount = e.garments.filter(g => g.stage === 'QA').length;
  const completedCount = e.garments.filter(g => g.stage === 'COMPLETED').length;
  const throughput = completedCount > 0 ? (completedCount / Math.max(1, (tick / 60))) : 0;
  const remainingTimeStr = throughput > 0 ? `${(wipCount / throughput).toFixed(1)} mins` : 'Pending Data...';
  
  return (
) => unsubscribe();
  }, []);

  const e = advancedFactoryEngine;


  const wipCount = e.garments.filter(g => g.stage !== 'COMPLETED').length;
  const qaCount = e.garments.filter(g => g.stage === 'QA').length;
  const completedCount = e.garments.filter(g => g.stage === 'COMPLETED').length;
  const throughput = completedCount > 0 ? (completedCount / Math.max(1, (tick / 60))) : 0;
  const remainingTimeStr = throughput > 0 ? `${(wipCount / throughput).toFixed(1)} mins` : 'Pending Data...';
  
  return (

    <div className="flex flex-col h-full bg-slate-950 text-slate-300 text-sm overflow-hidden p-2 gap-4">
      
      {/* Top Banner / Controls */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg p-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-bold text-amber-500 text-base">AUTONOMOUS GARMENT FACTORY</div>
          <div className="text-xs text-red-400 font-medium px-2 py-1 bg-red-900/30 rounded border border-red-800/50">
            SIMULATION MODE
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => e.start()} disabled={e.isRunning} className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded"><Play className="w-4 h-4"/></button>
          <button onClick={() => e.pause()} disabled={!e.isRunning} className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded"><Pause className="w-4 h-4"/></button>
          <button onClick={() => e.reset()} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded"><RotateCcw className="w-4 h-4"/></button>
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          
          <span className="text-xs text-slate-400">Speed:</span>
          {[1, 5, 10, 50].map(s => (
            <button key={s} onClick={() => e.setSpeed(s)} className={cn("px-2 py-1 text-xs rounded", e.simulationSpeed === s ? "bg-blue-600 text-white" : "bg-slate-800 hover:bg-slate-700")}>{s}x</button>
          ))}
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <button onClick={() => e.placeOrder({id: `HBX-${Math.floor(Math.random()*1000)}`, quantity: 10})} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold">Inject HBX-001 Order</button>
        </div>
      </div>

      {/* Summary Metrics Panel */}
      <div className="flex gap-4 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex-1 flex flex-col justify-center items-center">
           <div className="text-xs text-slate-500 font-bold tracking-wider mb-1">TOTAL WIP</div>
           <div className="text-2xl text-slate-200 font-light">{wipCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex-1 flex flex-col justify-center items-center">
           <div className="text-xs text-slate-500 font-bold tracking-wider mb-1">QA QUEUE</div>
           <div className="text-2xl text-amber-400 font-light">{qaCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex-1 flex flex-col justify-center items-center">
           <div className="text-xs text-slate-500 font-bold tracking-wider mb-1">PREDICTED BATCH COMPLETION</div>
           <div className="text-2xl text-blue-400 font-light">{remainingTimeStr}</div>
        </div>
      </div>
      
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Flow Diagram & Machine Grid */}
        <div className="w-2/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-amber-400 font-medium mb-4 text-xs tracking-wider">FACTORY DIGITAL-TWIN DIAGRAM</h3>
            <div className="grid grid-cols-5 gap-2 text-center text-xs relative">
               {['DESIGN', 'PATTERN', 'CUT', 'ASSEMBLY', 'SEWING', 'QA', 'FINISHING', 'PACKAGING', 'COMPLETED'].map(stage => {
                  const gCount = e.garments.filter(g => g.stage === stage).length;
                
  const wipCount = e.garments.filter(g => g.stage !== 'COMPLETED').length;
  const qaCount = e.garments.filter(g => g.stage === 'QA').length;
  const completedCount = e.garments.filter(g => g.stage === 'COMPLETED').length;
  const throughput = completedCount > 0 ? (completedCount / Math.max(1, (tick / 60))) : 0;
  const remainingTimeStr = throughput > 0 ? `${(wipCount / throughput).toFixed(1)} mins` : 'Pending Data...';
  
  return (

                    <div key={stage} className="p-2 border border-slate-700 bg-slate-800/50 rounded flex flex-col items-center justify-center relative min-h-[60px]">
                      <div className="text-[10px] text-slate-500 mb-1">{stage}</div>
                      {gCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]">
                          {gCount}
                        </div>
                      )}
                    </div>
                  );
               })}
               {e.garments.filter(g => g.stage === 'REWORK').length > 0 && (
                 <div className="p-2 border border-red-700 bg-red-900/30 rounded flex flex-col items-center justify-center relative min-h-[60px]">
                      <div className="text-[10px] text-red-400 mb-1">REWORK</div>
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold animate-pulse">
                        {e.garments.filter(g => g.stage === 'REWORK').length}
                      </div>
                  </div>
               )}
            </div>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col min-h-[400px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-amber-400 font-medium text-xs tracking-wider">MACHINE AGENTS</h3>
                <div className="flex gap-2">
                   <button onClick={() => setViewMode(v => v === "status" ? "efficiency" : "status")} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs flex items-center gap-1">Mode: {viewMode.toUpperCase()}</button>
                   <button onClick={() => e.simulateFault(e.machines[Math.floor(Math.random()*e.machines.length)].id)} className="px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 rounded text-xs flex items-center gap-1"><ServerCrash className="w-3 h-3"/> Chaos: Inject Fault</button>
                </div>
             </div>
             <div className="factory-layout grid grid-cols-1 xl:grid-cols-5 gap-4">
                {[
                  { id: 'CUT', label: 'Cutting', types: ['Cutting'] },
                  { id: 'ASSEMBLY', label: 'Assembly', types: ['Handling'] },
                  { id: 'SEWING', label: 'Sewing', types: ['Lockstitch', 'Overlock', 'Coverstitch', 'Buttonhole', 'ButtonAttachment'] },
                  { id: 'QA', label: 'QA / Inspect', types: ['VisionQA', 'Inspection'] },
                  { id: 'FINISHING', label: 'Finishing', types: ['Finishing'] },
                ].map(stage => (
                  <div key={stage.id} className="flex flex-col gap-2">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">{stage.label}</div>
                     {e.machines.filter(m => stage.types.includes(m.type)).map(m => (
                       <div key={m.id} onClick={() => setSelectedMachineId(m.id)} className={cn("border rounded p-3 text-xs relative overflow-hidden transition-colors duration-300 cursor-pointer hover:border-blue-500/50", m.state === 'FAULT' ? "border-red-500 bg-red-950/50" : m.state === 'COMPLETED' ? "border-emerald-400 bg-emerald-900/40" : m.state === 'RUNNING' ? "border-emerald-500/50 bg-emerald-950/20" : "border-slate-700 bg-slate-800/50")}>
                          <div className="flex justify-between mb-2">
                            <div className="font-bold text-slate-200">{m.name}</div>
                            <div className="text-[10px] text-slate-500">{m.id}</div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn("w-2 h-2 rounded-full", StateColor[m.state] || 'bg-slate-500', m.state === 'RUNNING' ? 'machine-running-state' : '')}></div>
                            <span className={cn("font-medium", m.state==='FAULT' ? "text-red-400" : "text-slate-400")}>{m.state}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-1 mt-2 text-[10px]">
                             <div className="text-slate-500">Job:</div>
                             <div className="text-right text-amber-200">{m.currentJobId || '--'}</div>
                             <div className="col-span-2 mt-2">
                                <div className="text-slate-500 text-[9px] mb-1 flex justify-between">
                                  <span>Output Trend</span>
                                  <span className="text-slate-300 font-bold">{m.productionCount} total</span>
                                </div>
                                <div className="h-8 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={m.productionHistory || []}>
                                      <Line type="monotone" dataKey="count" stroke={viewMode === 'efficiency' ? ( (m.utilization || 0) >= 80 ? '#10b981' : (m.utilization || 0) >= 40 ? '#f59e0b' : '#ef4444' ) : '#3b82f6'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                             </div>
                             <div className="text-slate-500">Temp/Vib:</div>
                             <div className="text-right text-slate-300">{m.temperature.toFixed(0)}°C / {m.vibration.toFixed(2)}g</div>
                          </div>

                          {m.state === 'FAULT' && (
                            <div className="mt-3 flex gap-2 relative z-10">
                              <button onClick={() => e.requestMaintenance(m.id)} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white text-[10px] py-1 rounded flex items-center justify-center gap-1"><Wrench className="w-3 h-3"/> Maint.</button>
                              <button onClick={() => e.recoverMachine(m.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-1 rounded">Reset</button>
                            </div>
                          )}
                          
                          {m.state === 'RUNNING' && (
                             <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-300" style={{width: `${(e.garments.find(g=>g.id===m.currentJobId)?.completionPercent || 0)}%`}}></div>
                          )}
                          {m.state === 'COMPLETED' && (
                             <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-900/80 animate-pulse">
                               <CheckCircle className="w-8 h-8 text-emerald-400" />
                             </div>
                          )}
                       </div>
                     ))}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: AI Log & Metrics */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
           
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-amber-400 font-medium mb-3 text-xs tracking-wider">PRODUCTION SUMMARY</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded text-center">
                    <div className="text-slate-500 text-[10px] uppercase">WIP</div>
                    <div className="text-lg font-bold text-blue-400">{e.garments.filter(g => g.stage !== 'COMPLETED' && g.stage !== 'PACKAGING').length}</div>
                 </div>
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded text-center">
                    <div className="text-slate-500 text-[10px] uppercase">QA Queue</div>
                    <div className="text-lg font-bold text-amber-400">{e.garments.filter(g => g.stage === 'QA').length}</div>
                 </div>
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded text-center">
                    <div className="text-slate-500 text-[10px] uppercase">Est. Finish</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {e.metrics.throughput > 0 && e.garments.filter(g => g.stage !== 'COMPLETED').length > 0 
                        ? `${Math.round(e.garments.filter(g => g.stage !== 'COMPLETED').length / Math.max(0.1, (e.metrics.throughput / Math.max(1, e.tickCount))))}t` 
                        : '--'}
                    </div>
                 </div>
              </div>
           </div>
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-amber-400 font-medium mb-3 text-xs tracking-wider">FACTORY METRICS</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded">
                    <div className="text-slate-500 text-[10px] uppercase">Throughput</div>
                    <div className="text-lg font-bold text-slate-200">{e.metrics.throughput} units</div>
                 </div>
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded">
                    <div className="text-slate-500 text-[10px] uppercase">QA Pass Rate</div>
                    <div className="text-lg font-bold text-emerald-400">{e.metrics.qualityPassRate}%</div>
                 </div>
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded">
                    <div className="text-slate-500 text-[10px] uppercase">Waste / Rework</div>
                    <div className="text-lg font-bold text-red-400">{e.metrics.waste}</div>
                 </div>
                 <div className="bg-slate-950 p-2 border border-slate-800 rounded">
                    <div className="text-slate-500 text-[10px] uppercase">Active Orders</div>
                    <div className="text-lg font-bold text-blue-400">{e.orders.filter(o=>o.status==='IN_PROGRESS').length}</div>
                 </div>
              </div>
           </div>

           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col min-h-[300px]">
              <div className="p-3 border-b border-slate-800 bg-slate-950 rounded-t-lg">
                <h3 className="text-amber-400 font-medium text-xs tracking-wider flex items-center gap-2"><Activity className="w-4 h-4"/> LOOM MIND DECISION STREAM</h3>
              </div>
              <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col-reverse gap-2 text-xs">
                 {e.events.map(ev => (
                    <div key={ev.id} className="border-l-2 border-slate-700 pl-2 py-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className={cn("font-bold text-[10px]", ev.source === 'LOOM MIND' ? "text-indigo-400" : ev.source === 'QA' ? "text-amber-400" : "text-slate-500")}>{ev.source}</span>
                          <span className="text-slate-600 text-[10px]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <div className={cn("text-slate-300", ev.type === 'FAULT' ? "text-red-400 font-medium" : "")}>{ev.message}</div>
                    </div>
                 ))}
                 {e.events.length === 0 && <div className="text-slate-600 italic">No events generated yet. Start the simulation.</div>}
              </div>
           </div>

        </div>
      </div>
      {selectedMachineId && <MachineControlPanel machineId={selectedMachineId} onClose={() => setSelectedMachineId(null)} />}
    </div>
  );
}
