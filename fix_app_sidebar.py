import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Wrap the sidebar properly
old_sidebar = '<div className="w-full md:w-80 border border-slate-800 rounded-xl bg-slate-900/50 flex flex-col overflow-hidden shrink-0">'
new_sidebar = """{isSidebarOpen && (
                <div className="w-full md:w-80 border border-slate-800 rounded-xl bg-slate-900/50 flex flex-col overflow-hidden shrink-0 transition-all duration-300">"""
content = content.replace(old_sidebar, new_sidebar)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Sidebar fixed")
