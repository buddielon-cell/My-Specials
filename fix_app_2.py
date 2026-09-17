import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("Preview uses \`index.html\` from the root directory.", "Preview uses `index.html` from the root directory.")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("App fixed 2")
