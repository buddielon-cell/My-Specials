lines = open('src/engines/aeon.ts').read().split('\n')
for i, line in enumerate(lines):
    if 'const codeStr = p.recommended_action.replace(/```[a-z]*' in line:
        # It's broken across lines
        lines[i] = "           const codeStr = p.recommended_action.replace(/```[a-z]*\\\\n?/g, '').replace(/```/g, '').trim();"
        # The next line is `?/g, '').replace(/```/g, '').trim();`
        lines[i+1] = ""

open('src/engines/aeon.ts', 'w').write('\n'.join(lines))
