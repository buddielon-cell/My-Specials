import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

static_old = "    addAirsEvent(\"RUNNING STATIC ANALYSIS...\");"
static_new = "    addAirsEvent(\"RUNNING STATIC ANALYSIS...\");\n    logEvent('RESEARCH', 'AIRS Static Analysis triggered');"
content = content.replace(static_old, static_new)
with open('src/App.tsx', 'w') as f:
    f.write(content)
