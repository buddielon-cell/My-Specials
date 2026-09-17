import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

state_injection = """  const [knowledgeIndex, setKnowledgeIndex] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [isBuildingUpgrade, setIsBuildingUpgrade] = useState(false);
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [copilotSuggestions, setCopilotSuggestions] = useState('');
  const [isCopilotAnalyzing, setIsCopilotAnalyzing] = useState(false);
  const [discoveryReport, setDiscoveryReport] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);

"""

content = content.replace("  const [fileSearchQuery, setFileSearchQuery] = useState('');", "  const [fileSearchQuery, setFileSearchQuery] = useState('');\n" + state_injection)

with open('src/App.tsx', 'w') as f:
    f.write(content)
