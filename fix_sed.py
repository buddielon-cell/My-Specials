import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# I used sed -i "s/import { /import { X, /" which replaced ALL 'import { ' with 'import { X, ' ! That's why!
content = content.replace("import { X, getDb", "import { getDb")
content = content.replace("import { X, collection", "import { collection")
content = content.replace("import { X, getWebLLMEngine", "import { getWebLLMEngine")
content = content.replace("import { X, DiffViewer", "import { DiffViewer")
content = content.replace("import { X, motion", "import { motion")
content = content.replace("import { X, runDiagnostics", "import { runDiagnostics")
content = content.replace("import { X, useMemo", "import { useMemo")

with open('src/App.tsx', 'w') as f:
    f.write(content)
