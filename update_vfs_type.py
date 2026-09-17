import re
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = content.replace(
    "type VFS = Record<string, { type: 'file' | 'dir', content?: string, url?: string }>;",
    "type VFS = Record<string, { type: 'file' | 'dir', content?: string, url?: string, size?: number, modifiedAt?: number }>;"
)
with open('src/App.tsx', 'w') as f:
    f.write(content)
