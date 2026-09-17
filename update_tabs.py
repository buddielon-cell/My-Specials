import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

tabs_content = """                      {aiSubTab === 'knowledge' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-purple-400 font-medium text-sm flex items-center gap-2">Knowledge Base</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Internal knowledge index synced with current file system state. The knowledge agent continuously indexes system updates and core upgrades.</p>
                            <button onClick={runKnowledgeReindex} disabled={isIndexing} className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded text-xs hover:bg-purple-600/40 disabled:opacity-50 transition-colors">
                               {isIndexing ? 'Indexing...' : 'Re-index Workspace Knowledge'}
                            </button>
                            {knowledgeIndex && (
                               <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 whitespace-pre-wrap font-mono custom-scrollbar max-h-64 overflow-y-auto">
                                 {knowledgeIndex}
                               </div>
                            )}
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'builder' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-indigo-400 font-medium text-sm flex items-center gap-2">System Builder</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">The Master Builder agent coordinates complex architectural migrations and structural rewrites.</p>
                            <button onClick={runBuilderUpgradeScan} disabled={isBuildingUpgrade} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded text-xs hover:bg-indigo-600/40 disabled:opacity-50 transition-colors">
                               {isBuildingUpgrade ? 'Scanning...' : 'Trigger System Upgrade Scan'}
                            </button>
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'copilot' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-cyan-400 font-medium text-sm flex items-center gap-2">Copilot Agent</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Inline pair-programming companion. Monitors file changes in real-time to provide contextual auto-completions and error corrections.</p>
                            <button onClick={() => setCopilotEnabled(!copilotEnabled)} className={cn("px-3 py-1.5 rounded text-xs border transition-colors", copilotEnabled ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-600/40" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700")}>
                               {copilotEnabled ? 'Disable Background Analysis' : 'Enable Background Analysis'}
                            </button>
                            
                            {copilotEnabled && (
                               <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs">
                                  <div className="text-slate-500 mb-2 font-medium">Live Suggestions (Target: {selectedFilePath || 'None'}):</div>
                                  <div className="text-slate-300 whitespace-pre-wrap font-mono custom-scrollbar max-h-48 overflow-y-auto">
                                    {isCopilotAnalyzing ? 'Analyzing changes...' : copilotSuggestions || 'No suggestions yet. Edit the file to trigger analysis.'}
                                  </div>
                               </div>
                            )}
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'discovery' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-orange-400 font-medium text-sm flex items-center gap-2">Discovery Diagnostics</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Scouts for unoptimized patterns, stale dependencies, and potential technical debt across the repository.</p>
                            <button onClick={runDiscoveryAudit} disabled={isDiscovering} className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded text-xs hover:bg-orange-600/40 disabled:opacity-50 transition-colors">
                               {isDiscovering ? 'Auditing...' : 'Run Deep Discovery Audit'}
                            </button>
                            {discoveryReport && (
                               <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 whitespace-pre-wrap font-mono custom-scrollbar max-h-64 overflow-y-auto">
                                 {discoveryReport}
                               </div>
                            )}
                          </div>
                        </div>
                      )}
"""

# Replace by literal string matching
target = """                        </div>
                      )}
                    </div>
                  ) : activeTab === 'airs' ?"""
                  
replacement = "                        </div>\n                      )}\n" + tabs_content + """                    </div>
                  ) : activeTab === 'airs' ?"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
