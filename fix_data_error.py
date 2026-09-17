import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = 'content: "Error: " + (data.error || "Failed to get AI response")'
replacement = 'content: "Error: " + (error || "Failed to get AI response")'

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

