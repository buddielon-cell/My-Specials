import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add History tab button
history_btn = """                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'history' ? "bg-slate-800 text-pink-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('history')}
                    >
                      <History className="w-3 h-3" /> History
                    </button>"""

if "activeTab === 'history'" not in content:
    content = content.replace("                      <Factory className=\"w-3 h-3\" /> Factory\n                    </button>", "                      <Factory className=\"w-3 h-3\" /> Factory\n                    </button>\n" + history_btn)

# Add History view
history_view = """                  ) : activeTab === 'history' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 overflow-y-auto">
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

with open('src/App.tsx', 'w') as f:
    f.write(content)
