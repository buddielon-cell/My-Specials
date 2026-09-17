import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix the render of ev.log
old_div = '>{ev.log}</div>'
new_div = '>{typeof ev.log === "object" ? JSON.stringify(ev.log, null, 2) : ev.log}</div>'
content = content.replace(old_div, new_div)

with open('src/App.tsx', 'w') as f:
    f.write(content)
