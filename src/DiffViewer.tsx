import React, { useState, useMemo } from 'react';
import * as Diff from 'diff';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Download, Code, GitMerge, ChevronRight, ChevronLeft, XCircle, GitPullRequest } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DiffViewerProps {
  proposal: any;
  currentContent: string;
  onClose: () => void;
  onAutoMerge: (mergedContent: string) => void;
}

export function DiffViewer({ proposal, currentContent, onClose, onAutoMerge }: DiffViewerProps) {
  const revisions = proposal.revisions || [];
  const [activeRev, setActiveRev] = useState(revisions.length - 1);
  const [acceptedHunks, setAcceptedHunks] = useState<Set<number>>(new Set());

  const currentRevision = revisions[activeRev];

  const patchObj = useMemo(() => {
    if (!currentRevision?.diff) return null;
    try {
      return Diff.parsePatch(currentRevision.diff)[0];
    } catch (e) {
      console.error("Failed to parse patch", e);
      return null;
    }
  }, [currentRevision]);

  // If we have a valid patchObj, we can start with all hunks accepted
  useMemo(() => {
    if (patchObj) {
      setAcceptedHunks(new Set(patchObj.hunks.map((_, i) => i)));
    }
  }, [patchObj]);

  const toggleHunk = (idx: number) => {
    setAcceptedHunks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleExport = () => {
    if (!currentRevision) return;
    const blob = new Blob([currentRevision.diff], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${proposal.id}-rev${currentRevision.version}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoMerge = () => {
    if (!patchObj) {
      alert("Invalid patch data.");
      return;
    }
    const confirm = window.confirm("Are you sure you want to Auto-Merge the accepted hunks to the core file?");
    if (!confirm) return;

    // Create a new patch with only accepted hunks
    const filteredPatch = {
      ...patchObj,
      hunks: patchObj.hunks.filter((_, i) => acceptedHunks.has(i))
    };

    // Note: If you construct a patch string, you need to use Diff API or custom.
    // Actually applyPatch can take the parsed array!
    const result = Diff.applyPatch(currentContent, [filteredPatch] as any);
    if (result === false) {
      alert("Failed to apply patch cleanly. The source file may have changed.");
      return;
    }
    
    onAutoMerge(result);
  };

  const direction = 1; // You could calculate direction for slide effect

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <GitPullRequest className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">
              Compare Proposed Changes - {proposal.title}
            </h3>
            {revisions.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-950 rounded border border-slate-700 p-0.5 ml-4">
                <button 
                  disabled={activeRev === 0} 
                  onClick={() => setActiveRev(r => r - 1)}
                  className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] px-2 text-slate-300 font-mono">v{currentRevision?.version}</span>
                <button 
                  disabled={activeRev === revisions.length - 1} 
                  onClick={() => setActiveRev(r => r + 1)}
                  className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
              <Download className="w-3 h-3"/> Export Diff
            </button>
            <button onClick={handleAutoMerge} className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
              <GitMerge className="w-3 h-3"/> Auto-Merge
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors ml-2">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-[#0d1117]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeRev}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar"
            >
              {!patchObj ? (
                <div className="text-slate-500 font-mono text-xs">
                  <p className="mb-4 text-slate-400">Raw Diff output:</p>
                  <pre className="bg-black p-4 rounded border border-slate-800 whitespace-pre-wrap">{currentRevision?.diff}</pre>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="text-xs text-slate-400 mb-2 font-sans bg-blue-900/10 border border-blue-900/30 p-2 rounded flex justify-between items-center">
                    <span><strong>Revision {currentRevision?.version}:</strong> {currentRevision?.changesMade}</span>
                  </div>
                  
                  {patchObj.hunks.map((hunk: any, hIdx: number) => {
                    const isAccepted = acceptedHunks.has(hIdx);
                    return (
                      <div key={hIdx} className={cn("border rounded-md overflow-hidden font-mono text-xs transition-colors", isAccepted ? "border-slate-700" : "border-slate-800 opacity-60")}>
                        <div className="bg-slate-800/80 px-3 py-1.5 flex justify-between items-center border-b border-slate-700">
                          <span className="text-slate-400">
                            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                          </span>
                          <button 
                            onClick={() => toggleHunk(hIdx)} 
                            className={cn("px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors", isAccepted ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-slate-700 text-slate-400 hover:text-white")}
                          >
                            {isAccepted ? <><Check className="w-3 h-3"/> Accepted</> : <><X className="w-3 h-3"/> Rejected</>}
                          </button>
                        </div>
                        <div className="bg-black py-2 overflow-x-auto">
                          {(() => {
                            let oldL = hunk.oldStart;
                            let newL = hunk.newStart;
                            return hunk.lines.map((line: string, lIdx: number) => {
                              const isAdded = line.startsWith('+');
                              const isRemoved = line.startsWith('-');
                              
                              let oldStr = '';
                              let newStr = '';
                              if (isRemoved) {
                                oldStr = String(oldL++);
                              } else if (isAdded) {
                                newStr = String(newL++);
                              } else {
                                oldStr = String(oldL++);
                                newStr = String(newL++);
                              }
                              
                              return (
                                <div key={lIdx} className={cn("flex px-2 py-[1px] min-w-max hover:bg-slate-800/50", isAdded ? "bg-emerald-900/20 text-emerald-300" : isRemoved ? "bg-red-900/20 text-red-300" : "text-slate-300")}>
                                  <div className="w-12 shrink-0 text-slate-600 select-none flex justify-between pr-2 border-r border-slate-800 mr-3 text-[10px]">
                                    <span>{oldStr}</span>
                                  </div>
                                  <div className="w-12 shrink-0 text-slate-600 select-none flex justify-between pr-2 border-r border-slate-800 mr-3 text-[10px]">
                                    <span>{newStr}</span>
                                  </div>
                                  <span className="whitespace-pre">{line}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
