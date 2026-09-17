import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update aiSubTab state
content = re.sub(
    r"const \[aiSubTab, setAiSubTab\] = useState\<'chat' \| 'proposals' \| 'history'\>\('chat'\);",
    r"const [aiSubTab, setAiSubTab] = useState<'chat' | 'proposals' | 'history' | 'knowledge' | 'builder' | 'copilot' | 'discovery'>('chat');",
    content
)

# 2. Add interval for auto-snapshot
snapshot_code = """
  // Periodic auto-snapshot to local storage every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setVfs(currentVfs => {
        if (currentVfs) {
          localStorage.setItem('vfs-auto-snapshot', JSON.stringify(currentVfs));
          // logEvent is technically missing from dep array if we don't watch it, but inside setInterval it's fine
          // Actually, we can just save it. We'll skip logEvent here to avoid hook dep warnings if possible,
          // or we can just call it since it uses useCallback
        }
        return currentVfs;
      });
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // When selected file changes, load its content to editor"""
content = content.replace("  // When selected file changes, load its content to editor", snapshot_code)

# 3. Add exportLedgerJson
export_code = """
  const exportLedgerJson = () => {
    const dataStr = JSON.stringify(ledgerEvents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airs_event_ledger.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const proposalStats = ['DRAFT', 'UNDER_REVIEW', 'AWAITING_HUMAN_APPROVAL', 'HUMAN_APPROVED'].map(status => ({
    name: status.replace(/_/g, ' '), count: proposals.filter(p => p.status === status).length
  }));

  return (
"""
content = content.replace("  return (", export_code, 1)

# 4. Update the tab buttons
tabs_code = """                      <div className="flex p-1 border-b border-slate-800 bg-slate-900 gap-1 text-[10px] flex-wrap justify-between">
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'chat' ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('chat')}>Chat</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'proposals' ? "bg-amber-600/20 text-amber-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('proposals')}>Proposals</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'history' ? "bg-emerald-600/20 text-emerald-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('history')}>History</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'knowledge' ? "bg-purple-600/20 text-purple-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('knowledge')}>Knowledge</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'builder' ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('builder')}>Builder</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'copilot' ? "bg-cyan-600/20 text-cyan-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('copilot')}>Copilot</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'discovery' ? "bg-orange-600/20 text-orange-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('discovery')}>Discovery</button>
                      </div>"""

# Need a robust replace for the old tabs div
old_tabs_regex = r'<div className="flex p-1 border-b border-slate-800 bg-slate-900 gap-1 text-xs">.*?</div>'
content = re.sub(old_tabs_regex, tabs_code, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
