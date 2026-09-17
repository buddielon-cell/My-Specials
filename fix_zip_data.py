import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const size = zipEntry._data ? zipEntry._data.uncompressedSize : 0;",
    "const size = (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0;"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

