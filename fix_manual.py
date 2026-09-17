with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "export default function App() {\\n" in line and i > 200:
        # We found the broken line.
        # Let's delete upwards until "const ResourceMonitor = () => {"
        start = i
        while start > 0 and "const ResourceMonitor = () => {" not in lines[start]:
            start -= 1
        
        if start > 0:
            lines = lines[:start] + [lines[i].split("};\n")[-1] if "};\n" in lines[i] else 'export default function App() {\\n  return (\\n\n']
            break

with open('src/App.tsx', 'w') as f:
    f.writelines(lines)
