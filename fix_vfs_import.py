import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """            const isText = relativePath.match(/\.(html|css|js|ts|jsx|tsx|json|md|txt|csv|svg|xml|yaml|yml|env)$/i);
            if (isText) {
              const text = await zipEntry.async('string');
              newVfs[relativePath] = { type: 'file', content: text };
            } else {
              const blob = await zipEntry.async('blob');
              newVfs[relativePath] = { type: 'file', url: URL.createObjectURL(blob) };
            }"""

replacement = """            const isText = relativePath.match(/\.(html|css|js|ts|jsx|tsx|json|md|txt|csv|svg|xml|yaml|yml|env)$/i);
            const size = zipEntry._data ? zipEntry._data.uncompressedSize : 0;
            const modifiedAt = zipEntry.date ? zipEntry.date.getTime() : Date.now();
            
            if (isText) {
              const text = await zipEntry.async('string');
              newVfs[relativePath] = { type: 'file', content: text, size: text.length || size, modifiedAt };
            } else {
              const blob = await zipEntry.async('blob');
              newVfs[relativePath] = { type: 'file', url: URL.createObjectURL(blob), size: blob.size || size, modifiedAt };
            }"""

content = content.replace(target, replacement)

# Do the same for dirs just in case
content = content.replace("newVfs[relativePath.replace(/\/$/, '')] = { type: 'dir' };", "newVfs[relativePath.replace(/\/$/, '')] = { type: 'dir', size: 0, modifiedAt: zipEntry.date ? zipEntry.date.getTime() : Date.now() };")

with open('src/App.tsx', 'w') as f:
    f.write(content)

