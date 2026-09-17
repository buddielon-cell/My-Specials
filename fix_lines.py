import re
with open('src/DiffViewer.tsx', 'r') as f:
    content = f.read()

bad_lines = """                          {hunk.lines.map((line: string, lIdx: number) => {
                            const isAdded = line.startsWith('+');
                            const isRemoved = line.startsWith('-');
                            
                            // Estimate line numbers (simplified)
                            // A real unified diff renderer would maintain counters for oldLine and newLine.
                            return (
                              <div key={lIdx} className={cn("flex px-2 py-[1px] min-w-max hover:bg-slate-800/50", isAdded ? "bg-emerald-900/20 text-emerald-300" : isRemoved ? "bg-red-900/20 text-red-300" : "text-slate-300")}>
                                <div className="w-12 shrink-0 text-slate-600 select-none flex justify-between pr-2 border-r border-slate-800 mr-3">
                                  <span>{isRemoved || !isAdded ? hunk.oldStart + lIdx : ''}</span>
                                </div>
                                <div className="w-12 shrink-0 text-slate-600 select-none flex justify-between pr-2 border-r border-slate-800 mr-3">
                                  <span>{isAdded || !isRemoved ? hunk.newStart + lIdx : ''}</span>
                                </div>
                                <span className="whitespace-pre">{line}</span>
                              </div>
                            );
                          })}"""

good_lines = """                          {(() => {
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
                          })()}"""

content = content.replace(bad_lines, good_lines)

with open('src/DiffViewer.tsx', 'w') as f:
    f.write(content)
