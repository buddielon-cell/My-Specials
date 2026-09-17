import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

resource_monitor = """
const ResourceMonitor = () => {
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
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
    <div className="mt-auto pt-4 border-t border-slate-800 p-4 shrink-0">
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

# Insert ResourceMonitor function definition
content = content.replace("export default function App() {", resource_monitor + "\nexport default function App() {")

# Insert ResourceMonitor component invocation
search_sidebar_end = """                  )}
                </div>
                {/* End of Sidebar */}"""

replace_sidebar_end = """                  )}
                  <ResourceMonitor />
                </div>
                {/* End of Sidebar */}"""

if "<ResourceMonitor />" not in content:
    content = content.replace(search_sidebar_end, replace_sidebar_end)

with open('src/App.tsx', 'w') as f:
    f.write(content)
