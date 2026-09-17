import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add history tab to nav
nav_search = """      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <Activity class="w-5 h-5" /> Analytics
      </a>"""

# Since I don't know the exact nav structure, let's find a unique anchor and replace it
# The nav looks like it has 'Activity' or 'Settings' or 'Files'
