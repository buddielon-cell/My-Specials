import re
with open('src/App.tsx', 'r') as f:
    content = f.read()

vfs_state = "const [vfs, setVfs] = useState<VFS | null>(null);"
vfs_def = "\n  const vfsRef = React.useRef(vfs);\n  React.useEffect(() => { vfsRef.current = vfs; }, [vfs]);"

if "const vfsRef = React.useRef(vfs);" not in content:
    content = content.replace(vfs_state, vfs_state + vfs_def)

with open('src/App.tsx', 'w') as f:
    f.write(content)
