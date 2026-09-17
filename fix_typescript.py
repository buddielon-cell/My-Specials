import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix memoryBank
content = content.replace("memoryBank.record('SEMANTIC', { query: msg, response: res.text });", "syncLogEvent('SYSTEM', 'HRE Copilot indexed query');")

# Fix history view
old_history_view = """                  ) : activeTab === 'history' ? (
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

new_history_view = """                  ) : activeTab === 'history' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-pink-400 text-lg font-bold tracking-widest flex items-center gap-2"><History className="w-5 h-5"/> IMMUTABLE LEDGER</h2>
                        <div className="flex gap-2">
                           <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400">{ledgerEvents.length} Events</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {ledgerEvents.map((event, idx) => (
                           <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                              <div className="flex justify-between text-xs mb-2">
                                 <span className={cn("font-bold uppercase", event.type === 'SYSTEM' ? 'text-blue-400' : event.type === 'PROPOSAL' ? 'text-emerald-400' : 'text-purple-400')}>{event.type}</span>
                                 <span className="text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="text-slate-300 text-sm">{event.description}</div>
                              {event.details && <div className="text-slate-500 text-xs mt-2 p-2 bg-slate-950 rounded">{event.details}</div>}
                           </div>
                        ))}
                      </div>
                    </div>"""

content = content.replace(old_history_view, new_history_view)

with open('src/App.tsx', 'w') as f:
    f.write(content)
