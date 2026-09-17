import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add import
import_statement = "import { aeonCore } from './engines/aeon';\n"
if "import { aeonCore }" not in content:
    content = content.replace("import AeonDashboard from './components/AeonDashboard';", "import AeonDashboard from './components/AeonDashboard';\n" + import_statement)

# Add attachment logic inside an existing useEffect, or create a new one.
# Let's find a good spot for a new useEffect.
# After `const saveFile = () => { ... }` ?
search_hook = "  const saveFile = () => {"
new_hook = """  useEffect(() => {
    aeonCore.attach(
      async (prompt) => {
         console.log("[AEON Real Mode] Sending prompt to AI...");
         const res = await callAI(prompt, null, []);
         return res.text;
      },
      (filepath, content) => {
         console.log("[HRE Real Mode] Writing to VFS at", filepath);
         setVfs(prev => ({
           ...prev,
           [filepath]: { ...prev[filepath], content, isModified: true, url: undefined }
         }));
      }
    );
  }, [callAI, setVfs]);

  const saveFile = () => {"""

content = content.replace(search_hook, new_hook)

with open('src/App.tsx', 'w') as f:
    f.write(content)
