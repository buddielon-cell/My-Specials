import re
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace("import { getDb", "import { getDb")
content = content.replace("import { X, ", "import { ")
with open('src/App.tsx', 'w') as f:
    f.write(content)
