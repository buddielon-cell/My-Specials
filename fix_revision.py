import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """        return {
          ...p,
          version: newVersion,
          status: 'UNDER_REVIEW',
          revisions: [...(p.revisions || []), { version: newVersion, changesMade: 'AI refinement based on scrutiny', diff: realPatch, timestamp: Date.now() }]
        };"""

replacement = """        const updated = {
          ...p,
          version: newVersion,
          status: 'UNDER_REVIEW' as ProposalStatus,
          revisions: [...(p.revisions || []), { version: newVersion, changesMade: 'AI refinement based on scrutiny', diff: realPatch, timestamp: Date.now() }]
        };
        setDoc(doc(db, "proposals", id), updated).catch(console.error);
        return updated;"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

