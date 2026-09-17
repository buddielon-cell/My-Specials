import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Imports
if "import { modelRouter }" not in content:
    content = content.replace("import { aeonCore } from './engines/aeon';", "import { aeonCore } from './engines/aeon';\nimport { modelRouter } from './core/model-router';\nimport { aeonRuntime } from './core/runtime';")

# Add a runtime states hook
runtime_state_hook = """  const [runtimeHealth, setRuntimeHealth] = useState(aeonRuntime.getAll());
  useEffect(() => {
    const interval = setInterval(() => {
       // Refresh health
       aeonRuntime.update('ollama_local', { status: modelRouter.health.ollama.status });
       setRuntimeHealth(aeonRuntime.getAll());
    }, 2000);
    return () => clearInterval(interval);
  }, []);
"""

if "const [runtimeHealth" not in content:
    content = content.replace("  const [testConnectionStatus, setTestConnectionStatus] = useState<{loading: boolean, success?: boolean, message?: string} | null>(null);", "  const [testConnectionStatus, setTestConnectionStatus] = useState<{loading: boolean, success?: boolean, message?: string} | null>(null);\n" + runtime_state_hook)


# Update the Workspace Resources panel to show REAL/SIMULATED tags
search_resources = """      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Workspace Resources</div>"""
replace_resources = """      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex justify-between items-center">
         <span>Workspace Resources</span>
         <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-500 border border-amber-800">SIMULATED</span>
      </div>"""

if "Workspace Resources</span>" not in content:
    content = content.replace(search_resources, replace_resources)


# Add Runtime Diagnostics panel
nav_tabs = """                      <button 
                        className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap", aiSubTab === 'backups' ? "border-purple-400 text-purple-400" : "border-transparent text-slate-400 hover:text-slate-200")}
                        onClick={() => setAiSubTab('backups')}
                      >
                        VFS Snapshots
                      </button>"""

nav_tabs_new = nav_tabs + """
                      <button 
                        className={cn("px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1", aiSubTab === 'runtime' ? "border-emerald-400 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200")}
                        onClick={() => setAiSubTab('runtime')}
                      >
                        <Activity className="w-4 h-4"/> Runtime Diagnostics
                      </button>"""

if "aiSubTab === 'runtime'" not in content:
    content = content.replace(nav_tabs, nav_tabs_new)


runtime_view = """
                    {aiSubTab === 'runtime' && (
                      <div className="p-4 space-y-4">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                               <Activity className="w-5 h-5"/> SOVEREIGN RUNTIME TRUTH LAYER
                            </h3>
                            <div className="text-xs text-slate-500">AEON Core OS Diagnostics</div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {runtimeHealth.map(sys => (
                               <div key={sys.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <div className="font-bold text-slate-200">{sys.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{sys.id} v{sys.version}</div>
                                     </div>
                                     <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", 
                                        sys.status === 'REAL' ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800" :
                                        sys.status === 'SIMULATED' ? "bg-amber-900/40 text-amber-400 border border-amber-800" :
                                        sys.status === 'DEGRADED' ? "bg-orange-900/40 text-orange-400 border border-orange-800" :
                                        "bg-red-900/40 text-red-400 border border-red-800"
                                     )}>
                                        {sys.status}
                                     </span>
                                  </div>
                                  <div className="text-xs text-slate-400 mt-2">
                                     Last Heartbeat: {new Date(sys.lastHeartbeat).toLocaleTimeString()}
                                  </div>
                                  {sys.errorState && (
                                     <div className="text-xs text-red-400 bg-red-950/30 p-2 rounded mt-1 border border-red-900/30">
                                        Error: {sys.errorState}
                                     </div>
                                  )}
                               </div>
                            ))}
                         </div>
                      </div>
                    )}"""

if "aiSubTab === 'runtime' && (" not in content:
    content = content.replace("                    {aiSubTab === 'backups' && (", runtime_view + "\n                    {aiSubTab === 'backups' && (")


with open('src/App.tsx', 'w') as f:
    f.write(content)
