import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

with open('AEON-RH-OMEGA-001.md', 'r') as f:
    omega_content = f.read()

omega_escaped = omega_content.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')

# 1. We will add it to the 'agentic' template.
search_str = "'package.json': { type: 'file', content: `{\\n  \"name\": \"agentic-dashboard\",\\n  \"version\": \"1.0.0\"\\n}` },"

if search_str in content:
    content = content.replace(search_str, search_str + f"\n        'AEON-RH-OMEGA-001.md': {{ type: 'file', content: `{omega_escaped}` }},")
else:
    print("Could not find agentic template package.json!")

# 2. We will also auto-inject it into the VFS if it's not there, so the user doesn't have to clear local storage.
search_effect = "    if (saved) {\n      try {\n        setVfs(JSON.parse(saved));\n      } catch (e) {"

replace_effect = f"""    if (saved) {{
      try {{
        const parsed = JSON.parse(saved);
        if (!parsed['AEON-RH-OMEGA-001.md']) {{
           parsed['AEON-RH-OMEGA-001.md'] = {{ type: 'file', content: `{omega_escaped}` }};
        }}
        setVfs(parsed);
      }} catch (e) {{"""

if search_effect in content:
    content = content.replace(search_effect, replace_effect)
else:
    print("Could not find saved effect block!")

with open('src/App.tsx', 'w') as f:
    f.write(content)
