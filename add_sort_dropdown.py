import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="Search files..."
                            value={fileSearchQuery}
                            onChange={(e) => setFileSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>"""

replacement = """                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="Search files..."
                            value={fileSearchQuery}
                            onChange={(e) => setFileSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                           <span>Sort by:</span>
                           <select 
                             value={sortMode}
                             onChange={(e) => setSortMode(e.target.value as any)}
                             className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 focus:outline-none"
                           >
                             <option value="alpha">Alphabetical</option>
                             <option value="size">File Size</option>
                             <option value="modified">Last Modified</option>
                           </select>
                        </div>
                      </div>"""

content = content.replace(target, replacement)
with open('src/App.tsx', 'w') as f:
    f.write(content)

