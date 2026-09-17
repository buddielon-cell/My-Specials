import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add DiffViewer import
import_statement = "import { DiffViewer } from './DiffViewer';\n"
if "import { DiffViewer }" not in content:
    content = content.replace("import JSZip from 'jszip';", "import JSZip from 'jszip';\n" + import_statement)

# 2. Add handleAutoMerge logic to App
auto_merge_fn = """
  const handleAutoMerge = (proposalId: string, mergedContent: string) => {
    // Assuming the proposal was targeting selectedFilePath or we just apply it there for now
    if (selectedFilePath && vfs && vfs[selectedFilePath]) {
      setVfs(prev => ({
        ...prev,
        [selectedFilePath]: { ...prev![selectedFilePath], content: mergedContent }
      }));
      setEditedContent(mergedContent);
      logEvent('DEPLOYMENT', `Auto-Merged proposal ${proposalId} into ${selectedFilePath}`);
    }
    updateProposalStatus(proposalId, 'HUMAN_APPROVED');
    setShowDiffModal(null);
  };
"""
# insert before handleGenerateRevision
content = content.replace("  const handleGenerateRevision = (id: string) => {", auto_merge_fn + "\n  const handleGenerateRevision = (id: string) => {")

# 3. Update handleGenerateRevision to compute a real patch
new_revision_logic = """  const handleGenerateRevision = (id: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id === id) {
        const newVersion = p.version.endsWith('.1') ? p.version.replace('.1', '.2') : p.version + '.1';
        const oldContent = (selectedFilePath && vfs && vfs[selectedFilePath]?.type === 'file') ? (vfs[selectedFilePath] as any).content : '';
        const newContent = p.proposedState || oldContent;
        const realPatch = Diff.createTwoFilesPatch(selectedFilePath || 'app.ts', selectedFilePath || 'app.ts', oldContent, newContent);
        
        logEvent('PROPOSAL', `Generated Revision ${newVersion} for ${id}`, `Skeptical Architect triggered Master Builder.`);
        
        return {
          ...p,
          version: newVersion,
          status: 'DRAFT',
          revisions: [
            ...(p.revisions || []),
            {
              version: newVersion,
              changesMade: "Incorporated feedback from Skeptical Architect. Addressed potential edge cases and optimized performance.",
              diff: realPatch,
              timestamp: Date.now()
            }
          ]
        };
      }
      return p;
    }));
  };"""
content = re.sub(r"  const handleGenerateRevision = \(id: string\) => \{[\s\S]*?  \};", new_revision_logic, content)

# 4. Replace existing modal markup with DiffViewer
old_modal_regex = r"\{showDiffModal && \([\s\S]*?Compare Proposed Changes[\s\S]*?\}\s*</main>"
new_modal_markup = """{showDiffModal && (
          <DiffViewer 
            proposal={proposals.find(p => p.id === showDiffModal)}
            currentContent={(selectedFilePath && vfs && vfs[selectedFilePath]?.type === 'file') ? (vfs[selectedFilePath] as any).content : ''}
            onClose={() => setShowDiffModal(null)}
            onAutoMerge={(mergedContent) => handleAutoMerge(showDiffModal, mergedContent)}
          />
        )}
      </main>"""
content = re.sub(r"\{showDiffModal && \(\s*<div className=\"fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4\">[\s\S]*?\}\s*</main>", new_modal_markup, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
