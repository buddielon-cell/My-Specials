import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix lines 150-170
bad_block = """  // Periodic auto-snapshot to local storage every 5 minutes) => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);"""
content = content.replace(bad_block, "")

with open('src/App.tsx', 'w') as f:
    f.write(content)
