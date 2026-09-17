import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

bad_injection = r'''
const ResourceMonitor = \(\) => \{.*?\}\;\nexport default function App\(\) \{\\n'''
content = re.sub(bad_injection, r'export default function App() {\\n', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
