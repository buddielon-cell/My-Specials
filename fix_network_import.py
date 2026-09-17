import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Network to the lucide-react import
content = content.replace("import { X, Cpu,", "import { X, Cpu, Network,")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Import fixed")
