import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('AGI Builder Core', 'Transcendence Lattice Core')

with open('src/App.tsx', 'w') as f:
    f.write(content)

