import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add chatMode and discoveryQuery states
states_to_add = """
  const [chatMode, setChatMode] = useState<'standard' | 'architect' | 'debugger' | 'visionary'>('standard');
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
"""
content = content.replace("  const [chatInput, setChatInput] = useState('');", "  const [chatInput, setChatInput] = useState('');\n" + states_to_add)

# Enhance the chat tab
old_chat = """                      {aiSubTab === 'chat' && (
                        <>
                          <div className="p-2 border-b border-slate-800 bg-slate-900 flex flex-col gap-2 shrink-0 text-xs">"""

new_chat = """                      {aiSubTab === 'chat' && (
                        <>
                          <div className="p-2 border-b border-slate-800 bg-slate-900 flex flex-col gap-2 shrink-0 text-xs">
                            
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto custom-scrollbar">
                               <button onClick={() => setChatMode('standard')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'standard' ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:bg-slate-900")}>Standard</button>
                               <button onClick={() => setChatMode('architect')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'architect' ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" : "text-slate-500 hover:bg-slate-900")}>Architect</button>
                               <button onClick={() => setChatMode('debugger')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'debugger' ? "bg-red-600/20 text-red-400 border border-red-500/30" : "text-slate-500 hover:bg-slate-900")}>Debugger</button>
                               <button onClick={() => setChatMode('visionary')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'visionary' ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-slate-500 hover:bg-slate-900")}>Visionary</button>
                            </div>
"""
content = content.replace(old_chat, new_chat)

# Enhance chat input box dynamically
old_input = """                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                              <input 
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    e.preventDefault();
                                    handleChatSubmit(e);
                                  }
                                }}
                                placeholder="Build me a to-do app... (Ctrl+Enter to send)"
                                disabled={isAiLoading}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                              />"""

new_input = """                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                              <div className="flex-1 relative">
                                  <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => {
                                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                        e.preventDefault();
                                        handleChatSubmit(e);
                                      }
                                    }}
                                    placeholder={
                                        chatMode === 'standard' ? "Build me a to-do app... (Ctrl+Enter to send)" :
                                        chatMode === 'architect' ? "Propose a system restructuring..." :
                                        chatMode === 'debugger' ? "Paste an error log or stack trace..." :
                                        "Describe an impossible feature idea..."
                                    }
                                    disabled={isAiLoading}
                                    className={cn(
                                        "w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50 transition-colors",
                                        chatMode === 'standard' ? "border-slate-800 focus:border-blue-500" :
                                        chatMode === 'architect' ? "border-slate-800 focus:border-amber-500" :
                                        chatMode === 'debugger' ? "border-slate-800 focus:border-red-500" :
                                        "border-slate-800 focus:border-purple-500"
                                    )}
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                      <button type="button" className="p-1 hover:bg-slate-800 rounded text-slate-500 transition-colors" title="Attach Context"><Plus className="w-4 h-4"/></button>
                                  </div>
                              </div>"""
content = content.replace(old_input, new_input)


# Enhance Discovery tab to include queries
old_discovery = """                      {aiSubTab === 'discovery' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-orange-400 font-medium text-sm flex items-center gap-2"><Search className="w-4 h-4" /> Deep Discovery Agent</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">The Discovery Agent crawls through all directories, analyzing dependencies, architectural patterns, and hidden vulnerabilities across the entire system surface.</p>
                            <button onClick={runDiscoveryAudit} disabled={isDiscovering} className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded text-xs hover:bg-orange-600/40 disabled:opacity-50 transition-colors">
                               {isDiscovering ? 'Auditing...' : 'Run Deep Discovery Audit'}
                            </button>"""

new_discovery = """                      {aiSubTab === 'discovery' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-orange-400 font-medium text-sm flex items-center gap-2"><Search className="w-4 h-4" /> Deep Discovery Agent</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">The Discovery Agent crawls through all directories, analyzing dependencies, architectural patterns, and hidden vulnerabilities across the entire system surface.</p>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    value={discoveryQuery}
                                    onChange={e => setDiscoveryQuery(e.target.value)}
                                    placeholder="Query discovery agent... (e.g., 'Find all unhandled promise rejections')" 
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                                />
                                <button onClick={runDiscoveryAudit} disabled={isDiscovering} className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs hover:bg-orange-500 disabled:opacity-50 transition-colors flex items-center gap-1">
                                   {isDiscovering ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Search className="w-3 h-3"/>} {isDiscovering ? 'Searching' : 'Query'}
                                </button>
                            </div>
                            <button onClick={runDiscoveryAudit} disabled={isDiscovering} className="w-full bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded text-xs hover:bg-orange-600/40 disabled:opacity-50 transition-colors">
                               {isDiscovering ? 'Auditing...' : 'Run Full Deep Discovery Audit'}
                            </button>"""
content = content.replace(old_discovery, new_discovery)


# Enhance Knowledge tab to include queries
old_knowledge = """                      {aiSubTab === 'knowledge' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-purple-400 font-medium text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Global Knowledge Engine</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Synchronized with WebLLM local models. Indexes documentation and system capabilities for rapid semantic retrieval.</p>
                            <button onClick={() => syncLogEvent('SYSTEM', 'Knowledge Base Re-index Triggered')} className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded text-xs hover:bg-purple-600/40 transition-colors flex items-center gap-2">
                               <RefreshCw className="w-3 h-3"/> Force Re-index
                            </button>"""

new_knowledge = """                      {aiSubTab === 'knowledge' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-purple-400 font-medium text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Global Knowledge Engine</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Synchronized with WebLLM local models. Indexes documentation and system capabilities for rapid semantic retrieval.</p>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    value={knowledgeQuery}
                                    onChange={e => setKnowledgeQuery(e.target.value)}
                                    placeholder="Semantic search... (e.g., 'How does the lattice worker sync?')" 
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                                <button onClick={() => syncLogEvent('RESEARCH', `Knowledge Query: ${knowledgeQuery}`)} className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs hover:bg-purple-500 transition-colors">
                                   Search
                                </button>
                            </div>
                            <button onClick={() => syncLogEvent('SYSTEM', 'Knowledge Base Re-index Triggered')} className="w-full justify-center bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded text-xs hover:bg-purple-600/40 transition-colors flex items-center gap-2">
                               <RefreshCw className="w-3 h-3"/> Force Re-index Corpus
                            </button>"""
content = content.replace(old_knowledge, new_knowledge)


with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Updated AI Core")
