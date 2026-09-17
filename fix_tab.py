import re
with open('src/App.tsx', 'r') as f:
    content = f.read()
content = re.sub(r"const \[activeTab, setActiveTab\] = useState<[^>]+>\('aeon'\);", "const [activeTab, setActiveTab] = useState<string>('aeon');", content)
with open('src/App.tsx', 'w') as f:
    f.write(content)
print("activeTab fixed")
