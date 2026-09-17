import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix import X issue again
content = content.replace("import { X, getDb", "import { getDb")

# Move vfsRef up above syncLogEvent
# Find vfsRef definition
vfs_def = "  const vfsRef = React.useRef(vfs);\n  React.useEffect(() => { vfsRef.current = vfs; }, [vfs]);"
content = content.replace(vfs_def, "")

# Find where vfs is defined and define vfsRef right there
vfs_state = "const [vfs, setVfs] = useState<VFS>(initialVfs);"
content = content.replace(vfs_state, vfs_state + "\n" + vfs_def)

with open('src/App.tsx', 'w') as f:
    f.write(content)
