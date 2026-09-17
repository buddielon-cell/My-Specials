import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
if "import NewsTicker" not in content:
    content = content.replace("import { getWebLLMEngine } from './lib/webllm';", "import { getWebLLMEngine } from './lib/webllm';\nimport NewsTicker from './components/NewsTicker';")

# Replace ticker div
old_ticker = """      <div className="h-8 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center overflow-hidden">
        <div className="bg-red-600 h-full flex items-center px-3 font-bold text-xs uppercase shrink-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.5)] tracking-widest text-white">LIVE NEWS</div>
        <div className="flex-1 overflow-hidden relative h-full">
           <div className="absolute whitespace-nowrap animate-[ticker_30s_linear_infinite] flex items-center h-full text-xs text-slate-300">
             <span className="mx-4">🌍 GLOBAL MARKETS RALLY AS TECH STOCKS SURGE</span>
             <span className="mx-4 text-blue-400">•</span>
             <span className="mx-4">🤖 AI STUDIO RELEASES NEW HARDWARE RESEARCH ENVIRONMENT</span>
             <span className="mx-4 text-blue-400">•</span>
             <span className="mx-4">🏭 FACTORY EFFICIENCY REACHES ALL-TIME HIGH OF 94%</span>
             <span className="mx-4 text-blue-400">•</span>
             <span className="mx-4">⚡ QUANTUM COMPUTING BREAKTHROUGH ANNOUNCED IN GENEVA</span>
             <span className="mx-4 text-blue-400">•</span>
             <span className="mx-4">🚀 AERO-SPACE EXPORTS QUADRUPLE IN Q3</span>
           </div>
        </div>
      </div>"""

new_ticker = """      <NewsTicker />"""

content = content.replace(old_ticker, new_ticker)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Ticker replaced")
