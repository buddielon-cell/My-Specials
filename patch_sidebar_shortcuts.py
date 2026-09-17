import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add ResourceMonitor component
resource_monitor = """
const ResourceMonitor = () => {
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time CPU and Memory usage
      setCpu(prev => {
        const target = Math.random() * 40 + 10;
        return Math.floor(prev + (target - prev) * 0.3);
      });
      setMem(prev => {
        const target = Math.random() * 50 + 30;
        return Math.floor(prev + (target - prev) * 0.1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-auto pt-4 border-t border-slate-800 p-4">
      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Workspace Resources</div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">CPU Usage</span>
            <span className={cpu > 40 ? "text-amber-400" : "text-emerald-400"}>{cpu}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 ${cpu > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${cpu}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Memory</span>
            <span className={mem > 70 ? "text-amber-400" : "text-emerald-400"}>{mem}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 ${mem > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${mem}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

if "const ResourceMonitor" not in content:
    content = content.replace("export default function App() {", resource_monitor + "\nexport default function App() {")

# Add shortcuts logic
shortcuts_logic = """
  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            setActiveTab('ai');
            setAiSubTab('chat');
            break;
          case 'b':
            e.preventDefault();
            setActiveTab('build');
            break;
          case 'e':
            e.preventDefault();
            setActiveTab('aeon');
            break;
          case 'h':
            e.preventDefault();
            setActiveTab('history');
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
"""
search_hook = "  const saveFile = () => {"
if "case 'b':" not in content:
    content = content.replace(search_hook, shortcuts_logic + "\n" + search_hook)

# Add sidebar resource monitor
sidebar_search = "        </nav>"
sidebar_replace = "        </nav>\n        <ResourceMonitor />"
if "<ResourceMonitor />" not in content:
    content = content.replace(sidebar_search, sidebar_replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)
