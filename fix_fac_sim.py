import re

with open('src/components/FactorySimulation.tsx', 'r') as f:
    content = f.read()

# Replace the exact bad string:
bad_string = """           <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">"""

good_string = """           <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">"""

content = content.replace(bad_string, good_string)

with open('src/components/FactorySimulation.tsx', 'w') as f:
    f.write(content)
print("FactorySimulation fixed")
