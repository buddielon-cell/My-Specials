with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "export default function App() {\\n  return (\\n\n",
    "export default function App() {\\n  return (\\n    <div className=\\\"p-8 text-center\\\">\\n      <h1 className=\\\"text-3xl font-bold text-blue-500\\\">React + Tailwind</h1>\\n      <p className=\\\"mt-4 text-slate-500\\\">Ready to build!</p>\\n    </div>\\n  )\\n}` },\n      };\n    } else if (type === 'agentic') {\n      newVfs = {"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
