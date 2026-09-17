import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

states = """  const [vfs, setVfs] = useState<VFS | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [previewFilePath, setPreviewFilePath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<'alpha' | 'size' | 'modified'>('alpha');
  const [focusedNodeIndex, setFocusedNodeIndex] = useState<number>(-1);
"""

content = re.sub(r"  const \[vfs, setVfs\] = useState<VFS \| null>\(null\);\n  const \[selectedFilePath, setSelectedFilePath\] = useState<string \| null>\(null\);", states, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

