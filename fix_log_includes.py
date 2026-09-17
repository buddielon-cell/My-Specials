import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix the render of latticeEventStream where `log` object is being treated as string
old_render = """                                      {latticeEventStream.map((log, idx) => (
                                        <div key={idx} className={cn("py-0.5 whitespace-pre-wrap break-words", log.includes('STARTED') || log.includes('TERMINATED') ? "text-purple-400" : log.includes('INTERVENTION') ? "text-amber-400" : log.includes('SBS RESULTS') || log.includes('---') ? "text-blue-400" : log.startsWith('>') ? "text-slate-300 font-bold" : log.startsWith('AGENT RESPONSE') ? "text-emerald-400" : log.startsWith('ERROR') ? "text-red-400" : log.includes('ANALYSIS') ? "text-amber-300" : "")}>{log}</div>
                                      ))}"""

new_render = """                                      {latticeEventStream.map((ev, idx) => (
                                        <div key={ev.id || idx} className={cn("py-0.5 whitespace-pre-wrap break-words", ev.log.includes('STARTED') || ev.log.includes('TERMINATED') ? "text-purple-400" : ev.log.includes('INTERVENTION') ? "text-amber-400" : ev.log.includes('SBS RESULTS') || ev.log.includes('---') ? "text-blue-400" : ev.log.startsWith('>') ? "text-slate-300 font-bold" : ev.log.startsWith('AGENT RESPONSE') ? "text-emerald-400" : ev.log.startsWith('ERROR') ? "text-red-400" : ev.log.includes('ANALYSIS') ? "text-amber-300" : "")}>{ev.log}</div>
                                      ))}"""

content = content.replace(old_render, new_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)
