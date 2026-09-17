import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We need to find the three instances of `'index.html': { type: 'file', content: \`<!DOCTYPE html>...</html>\` }`

matches = list(re.finditer(r"        'index\.html': \{ type: 'file', content: `<!DOCTYPE html>.*?</html>` \}", content, re.DOTALL))

if len(matches) == 3:
    # First one is HTML template
    html_template = """        'index.html': { type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML/JS App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
    <div class="text-center">
        <h1 class="text-4xl font-bold text-blue-400 mb-4">Static App</h1>
        <p class="text-gray-400">Welcome to your new static app.</p>
    </div>
</body>
</html>` }"""

    # Second one is React template
    react_template = """        'index.html': { type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>` }"""

    new_content = content[:matches[0].start()] + html_template + content[matches[0].end():matches[1].start()] + react_template + content[matches[1].end():]
    
    with open('src/App.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed.")
else:
    print(f"Found {len(matches)} matches, expected 3.")

