import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

shortcuts_logic = """
  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            setActiveTab('ai');
            setAiSubTab('chat');
            break;
          case 'b':
            e.preventDefault();
            setActiveTab('factory'); // or 'build', but factory is closest to build tools here
            break;
          case 'e':
            e.preventDefault();
            setActiveTab('aeon');
            break;
          case 'h':
            e.preventDefault();
            setActiveTab('history');
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
"""

if "window.addEventListener('keydown'" not in content:
    content = content.replace("  const saveFile = () => {", shortcuts_logic + "\n  const saveFile = () => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)
