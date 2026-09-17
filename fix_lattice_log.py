import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix ev.log.includes to use String(ev.log)
old_line = 'ev.log.includes(\'STARTED\') || ev.log.includes(\'TERMINATED\') ? "text-purple-400" : ev.log.includes(\'INTERVENTION\') ? "text-amber-400" : ev.log.includes(\'SBS RESULTS\') || ev.log.includes(\'---\') ? "text-blue-400" : ev.log.startsWith(\'>\') ? "text-slate-300 font-bold" : ev.log.startsWith(\'AGENT RESPONSE\') ? "text-emerald-400" : ev.log.startsWith(\'ERROR\') ? "text-red-400" : ev.log.includes(\'ANALYSIS\') ? "text-amber-300" : ""'
new_line = 'String(ev.log).includes(\'STARTED\') || String(ev.log).includes(\'TERMINATED\') ? "text-purple-400" : String(ev.log).includes(\'INTERVENTION\') ? "text-amber-400" : String(ev.log).includes(\'SBS RESULTS\') || String(ev.log).includes(\'---\') ? "text-blue-400" : String(ev.log).startsWith(\'>\') ? "text-slate-300 font-bold" : String(ev.log).startsWith(\'AGENT RESPONSE\') ? "text-emerald-400" : String(ev.log).startsWith(\'ERROR\') ? "text-red-400" : String(ev.log).includes(\'ANALYSIS\') ? "text-amber-300" : ""'

content = content.replace(old_line, new_line)

with open('src/App.tsx', 'w') as f:
    f.write(content)
