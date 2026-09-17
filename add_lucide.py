import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('ChevronDown, ', 'ChevronDown, ChevronRight, ')

with open('src/App.tsx', 'w') as f:
    f.write(content)

