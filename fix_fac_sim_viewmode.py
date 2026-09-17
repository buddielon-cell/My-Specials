import re
with open('src/components/FactorySimulation.tsx', 'r') as f:
    content = f.read()

old_getMachineClass = """  const getMachineClass = (m: AdvancedMachine) => {
    if (m.state === 'FAULT') return "border-red-500 bg-red-950/50";
    if (viewMode === 'efficiency') {"""

new_getMachineClass = """  const getMachineClass = (m: AdvancedMachine, viewMode: string) => {
    if (m.state === 'FAULT') return "border-red-500 bg-red-950/50";
    if (viewMode === 'efficiency') {"""

content = content.replace(old_getMachineClass, new_getMachineClass)
content = content.replace("className={cn(\"border rounded p-3 text-xs relative overflow-hidden transition-colors duration-300 cursor-pointer hover:border-blue-500/50\", getMachineClass(m))}",
                          "className={cn(\"border rounded p-3 text-xs relative overflow-hidden transition-colors duration-300 cursor-pointer hover:border-blue-500/50\", getMachineClass(m, viewMode))}")

with open('src/components/FactorySimulation.tsx', 'w') as f:
    f.write(content)
print("FactorySimulation viewmode fixed")
