import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

agent_logic = """
  const runKnowledgeReindex = async () => {
    setIsIndexing(true);
    setKnowledgeIndex('Generating knowledge index...');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "Analyze the current workspace files (VFS) and generate a comprehensive structural knowledge index mapping out the architecture, dependencies, and core features. Use Markdown formatting.", 
          vfs: vfs, chatHistory: [], provider: aiProvider, model: aiModel, customApiKey
        })
      });
      const data = await res.json();
      if (res.ok) setKnowledgeIndex(data.text);
      else setKnowledgeIndex("Error: " + data.error);
    } catch (e: any) {
      setKnowledgeIndex("Exception: " + e.message);
    }
    setIsIndexing(false);
  };

  const runBuilderUpgradeScan = async () => {
    setIsBuildingUpgrade(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "Review the workspace VFS. Generate 1 structural upgrade proposal (e.g. state management improvement, component extraction, performance upgrade). Return ONLY a JSON object with this exact schema: { title: string, riskTier: string, objective: string, rationale: string, proposedState: string }", 
          vfs: vfs, chatHistory: [], provider: aiProvider, model: aiModel, customApiKey
        })
      });
      const data = await res.json();
      if (res.ok) {
        let jsonStr = data.text;
        const match = jsonStr.match(/```json\\n([\\s\\S]*?)\\n```/) || jsonStr.match(/\\{[\\s\\S]*\\}/);
        if (match) jsonStr = match[1] || match[0];
        const p = JSON.parse(jsonStr);
        const newP = {
          id: `PROP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          ...p,
          version: '1.0',
          status: 'DRAFT',
          timestamp: Date.now()
        };
        setProposals(prev => [newP, ...prev]);
        setAiSubTab('proposals');
      } else {
        alert('Builder error: ' + data.error);
      }
    } catch (e: any) {
      alert('Builder exception: ' + e.message);
    }
    setIsBuildingUpgrade(false);
  };

  const runDiscoveryAudit = async () => {
    setIsDiscovering(true);
    setDiscoveryReport('Scanning repository for technical debt and optimizations...');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: "Run a deep discovery diagnostic audit on the codebase. Identify technical debt, unoptimized patterns, stale dependencies, and architectural bottlenecks. Return a detailed Markdown report.", 
          vfs: vfs, chatHistory: [], provider: aiProvider, model: aiModel, customApiKey
        })
      });
      const data = await res.json();
      if (res.ok) setDiscoveryReport(data.text);
      else setDiscoveryReport("Error: " + data.error);
    } catch (e: any) {
      setDiscoveryReport("Exception: " + e.message);
    }
    setIsDiscovering(false);
  };

  // Copilot debounced analysis
  useEffect(() => {
    if (!copilotEnabled || !selectedFilePath || !vfs) return;
    
    const timeout = setTimeout(async () => {
      setIsCopilotAnalyzing(true);
      try {
        const fileContent = vfs[selectedFilePath]?.type === 'file' ? (vfs[selectedFilePath] as any).content : '';
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `You are an inline Copilot agent. Review the current file (${selectedFilePath}) for potential improvements, completions, or bugs. Keep your feedback brief and actionable.\\n\\nCurrent Content:\\n${editedContent || fileContent}`, 
            vfs: null, chatHistory: [], provider: aiProvider, model: aiModel, customApiKey
          })
        });
        const data = await res.json();
        if (res.ok) setCopilotSuggestions(data.text);
        else setCopilotSuggestions("Copilot error: " + data.error);
      } catch (e: any) {
        setCopilotSuggestions("Copilot exception: " + e.message);
      }
      setIsCopilotAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editedContent, selectedFilePath, copilotEnabled, vfs, aiProvider, aiModel, customApiKey]);

  const saveFile = () => {"""

content = content.replace("  const saveFile = () => {", agent_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
