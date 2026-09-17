with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i in range(1150, 1190):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")
