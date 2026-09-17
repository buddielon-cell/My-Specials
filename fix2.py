with open('src/App.tsx', 'r') as f:
    content = f.read()

import re
# We want to remove the second occurrence of ResourceMonitor to the next export default function App
pattern = re.compile(r"const ResourceMonitor = \(\) => \{.*?\};\n\nexport default function App\(\) \{\\n", re.DOTALL)
content = pattern.sub(r"export default function App() {\\n", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
