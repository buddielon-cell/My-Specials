import React, { useState } from 'react';
import { advancedFactoryEngine, AdvancedMachine } from '../engines/advancedFactory';
import { cn } from '../lib/utils';
import { X, AlertTriangle, GripVertical, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function MachineControlPanel({ machineId, onClose }: { machineId: string, onClose: () => void }) {
  const m = advancedFactoryEngine.machines.find(mac => mac.id === machineId);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  if (!m) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== index) {
      advancedFactoryEngine.reorderQueue(machineId, draggedIdx, index);
    }
    setDraggedIdx(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
           <div>
             <h2 className="text-lg font-bold text-slate-200">{m.name} <span className="text-slate-500 text-sm font-normal">({m.id})</span></h2>
             <div className="text-xs text-slate-400">Type: {m.type} | State: <span className={cn(m.state === 'FAULT' ? "text-red-400" : m.state === 'RUNNING' ? "text-emerald-400" : "text-amber-400")}>{m.state}</span></div>
           </div>
           <div className="flex gap-2">
             <button 
               onClick={() => advancedFactoryEngine.emergencyStop(m.id)}
               className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
             >
               <AlertTriangle className="w-4 h-4" /> E-STOP
             </button>
             <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded">
                <X className="w-5 h-5" />
             </button>
           </div>
        </div>
        
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
           {/* Telemetry Chart */}
           <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><Activity className="w-3 h-3"/> VIBRATION & TEMP TELEMETRY (10m window)</h3>
              <div className="h-40 w-full text-xs">
                {m.telemetryHistory && m.telemetryHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.telemetryHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" stroke="#475569" tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis yAxisId="left" stroke="#ef4444" tick={{fill: '#ef4444', fontSize: 10}} />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{fill: '#f59e0b', fontSize: 10}} />
                      <Tooltip 
                         contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', color: '#cbd5e1'}}
                         itemStyle={{fontSize: '12px'}}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Temp (°C)" isAnimationActive={false} />
                      <Line yAxisId="right" type="monotone" dataKey="vib" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vibration (g)" isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-600">No telemetry data available yet.</div>
                )}
              </div>
           </div>

           {/* Queue Management */}
           <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex-1 flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 mb-2">PENDING JOBS QUEUE</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                 {m.queue.map((jobId, idx) => {
                    const garment = advancedFactoryEngine.garments.find(g => g.id === jobId);
                    return (
                      <div 
                        key={jobId} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="bg-slate-900 border border-slate-700 p-2 rounded flex items-center gap-3 cursor-grab hover:border-blue-500 active:cursor-grabbing transition-colors"
                      >
                         <GripVertical className="w-4 h-4 text-slate-600" />
                         <div className="flex-1 flex justify-between items-center text-xs">
                           <span className="font-bold text-slate-300">{jobId}</span>
                           <span className="text-slate-500">{garment ? `${garment.designId} - Size ${garment.size}` : 'Unknown Job'}</span>
                         </div>
                      </div>
                    );
                 })}
                 {m.queue.length === 0 && (
                   <div className="text-center p-4 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded">
                     Queue is empty.
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
