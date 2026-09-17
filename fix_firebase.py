import re
with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

# Replace getFirestore with initializeFirestore
old_import = "import { getFirestore } from 'firebase/firestore';"
new_import = "import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';"
content = content.replace(old_import, new_import)

old_init = 'export const db = getFirestore(app, "ai-studio-buildviewer-1b939f2b-63e9-4cbb-bc4b-da7f21b40f68");'
new_init = '''export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
}, "ai-studio-buildviewer-1b939f2b-63e9-4cbb-bc4b-da7f21b40f68");'''
content = content.replace(old_init, new_init)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
