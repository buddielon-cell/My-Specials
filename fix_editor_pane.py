import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# First replace selectedFilePath hook deps etc if needed, but it's okay, activeFile is just for display.
# Let's insert activeFilePath logic.

# In the render area:
target_render = """                   ) : selectedFilePath && vfs[selectedFilePath] ? (
                     <div className="flex-1 flex flex-col min-h-0">
                       <div className="p-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
                         <span className="text-sm font-medium text-slate-300 truncate px-2">{selectedFilePath}</span>
                         {vfs[selectedFilePath].content !== undefined && (
                           <button """

replacement_render = """                   ) : (previewFilePath || selectedFilePath) && vfs[previewFilePath || selectedFilePath!] ? (
                     <div className="flex-1 flex flex-col min-h-0">
                       <div className="p-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
                         <span className={cn("text-sm font-medium truncate px-2", previewFilePath ? "text-blue-300 italic" : "text-slate-300")}>
                            {previewFilePath || selectedFilePath}
                         </span>
                         {vfs[previewFilePath || selectedFilePath!].content !== undefined && !previewFilePath && (
                           <button """

content = content.replace(target_render, replacement_render)


# And down in the file body:
target_body = """                       <div className="flex-1 overflow-hidden relative">
                         {vfs[selectedFilePath].url && selectedFilePath.match(/\.(png|jpe?g|gif|svg|webp)$/i) ? (
                           <div className="flex items-center justify-center h-full bg-slate-950 p-4">
                             <img src={vfs[selectedFilePath].url} alt={selectedFilePath} className="max-w-full max-h-full object-contain" />
                           </div>
                         ) : vfs[selectedFilePath].content !== undefined ? (
                           isEditing ? (
                             <textarea 
                               value={editedContent}
                               onChange={(e) => setEditedContent(e.target.value)}
                               onKeyDown={e => {
                                 if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                                   e.preventDefault();
                                   saveFile();
                                 }
                               }}
                               className="w-full h-full bg-slate-950 text-slate-300 font-mono text-sm p-4 focus:outline-none resize-none custom-scrollbar"
                               spellCheck={false}
                             />
                           ) : (
                             <pre className="w-full h-full bg-slate-950 text-slate-300 font-mono text-sm p-4 overflow-auto custom-scrollbar">
                               <code>{vfs[selectedFilePath].content}</code>
                             </pre>
                           )
                         ) : ("""

replacement_body = """                       <div className="flex-1 overflow-hidden relative">
                         {(() => {
                           const activeFile = previewFilePath || selectedFilePath!;
                           const node = vfs[activeFile];
                           if (node.url && activeFile.match(/\.(png|jpe?g|gif|svg|webp)$/i)) {
                             return (
                               <div className="flex items-center justify-center h-full bg-slate-950 p-4">
                                 <img src={node.url} alt={activeFile} className="max-w-full max-h-full object-contain" />
                               </div>
                             );
                           }
                           if (node.content !== undefined) {
                             if (isEditing && !previewFilePath) {
                               return (
                                 <textarea 
                                   value={editedContent}
                                   onChange={(e) => setEditedContent(e.target.value)}
                                   onKeyDown={e => {
                                     if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                                       e.preventDefault();
                                       saveFile();
                                     }
                                   }}
                                   className="w-full h-full bg-slate-950 text-slate-300 font-mono text-sm p-4 focus:outline-none resize-none custom-scrollbar"
                                   spellCheck={false}
                                 />
                               );
                             } else {
                               return (
                                 <pre className="w-full h-full bg-slate-950 text-slate-300 font-mono text-sm p-4 overflow-auto custom-scrollbar">
                                   <code>{node.content}</code>
                                 </pre>
                               );
                             }
                           }
                           return (
                              <div className="flex items-center justify-center text-slate-500 h-full">
                                 Binary file cannot be previewed in text mode.
                              </div>
                           );
                         })()}"""

content = content.replace(target_body, replacement_body)

# Don't forget to update the copilot effect to use the actual active file, or just use selectedFilePath since preview is temporary.
# I think using selectedFilePath for Copilot is perfectly fine and desired.

with open('src/App.tsx', 'w') as f:
    f.write(content)

