import re

with open('src/engines/aeon.ts', 'r') as f:
    content = f.read()

# Replace the broken line
content = re.sub(r'const codeStr = p.recommended_action.replace\(/```\[a-z\]\*\n\?/g, \'\'\).replace\(/```/g, \'\'\).trim\(\);', 
                 "           const codeStr = p.recommended_action.replace(/```[a-z]*\\\\n?/g, '').replace(/```/g, '').trim();", 
                 content)

with open('src/engines/aeon.ts', 'w') as f:
    f.write(content)
