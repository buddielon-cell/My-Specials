import re
with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

new_init = '''export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true
}, "ai-studio-buildviewer-1b939f2b-63e9-4cbb-bc4b-da7f21b40f68");'''
content = content.replace('''export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
}, "ai-studio-buildviewer-1b939f2b-63e9-4cbb-bc4b-da7f21b40f68");''', new_init)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
