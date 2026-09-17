import json
import base64

with open('map.b64', 'r') as f:
    b64 = f.read().strip()

decoded = base64.b64decode(b64).decode('utf-8')
data = json.loads(decoded)

for i, source in enumerate(data.get('sources', [])):
    if 'App.tsx' in source:
        content = data['sourcesContent'][i]
        with open('src/App.tsx.recovered', 'w') as out:
            out.write(content)
        print(f"Recovered App.tsx! {len(content.splitlines())} lines.")
        break
