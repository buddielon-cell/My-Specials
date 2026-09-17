import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_render = """                        <AeonDashboard onQuerySubmit={(q) => {
                          setActiveTab('ai');
                          setAiSubTab('chat');
                          submitChatMessage(q);
                        }} />"""

new_render = """                        <AeonDashboard />"""

content = content.replace(old_render, new_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)
