import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

tree_logic = """
  // Update expanded folders on search
  useEffect(() => {
    if (fileSearchQuery && vfs) {
      const newExpanded = new Set(expandedFolders);
      Object.keys(vfs).forEach(path => {
        if (path.toLowerCase().includes(fileSearchQuery.toLowerCase())) {
          const parts = path.split('/');
          let curr = '';
          for (let i = 0; i < parts.length - 1; i++) {
            curr += (curr ? '/' : '') + parts[i];
            newExpanded.add(curr);
          }
        }
      });
      setExpandedFolders(newExpanded);
    }
  }, [fileSearchQuery, vfs]);

  // Tree rendering
  const toggleFolder = (folderPath: string) => {
    const next = new Set(expandedFolders);
    if (next.has(folderPath)) {
      next.delete(folderPath);
    } else {
      next.add(folderPath);
    }
    setExpandedFolders(next);
  };

  const renderTree = () => {
    if (!vfs) return null;

    let filteredKeys = Object.keys(vfs).filter(path => 
      fileSearchQuery ? path.toLowerCase().includes(fileSearchQuery.toLowerCase()) : true
    );

    // Sorting
    filteredKeys.sort((a, b) => {
      const nodeA = vfs[a];
      const nodeB = vfs[b];
      
      // Always put dirs first in the same level? Wait, sorting flat paths handles this somewhat.
      // We will sort just the keys according to the selected mode.
      if (sortMode === 'size') {
        const sA = nodeA.size || 0;
        const sB = nodeB.size || 0;
        if (sA !== sB) return sB - sA;
      } else if (sortMode === 'modified') {
        const mA = nodeA.modifiedAt || 0;
        const mB = nodeB.modifiedAt || 0;
        if (mA !== mB) return mB - mA;
      }
      return a.localeCompare(b);
    });

    const root: Record<string, any> = {};
    for (const path of filteredKeys) {
      const parts = path.split('/');
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] === 'string') current[parts[i]] = {};
        current = current[parts[i]];
      }
      const lastPart = parts[parts.length - 1];
      if (vfs[path].type === 'dir') {
        if (!current[lastPart] || typeof current[lastPart] === 'string') current[lastPart] = {};
      } else {
        current[lastPart] = path;
      }
    }

    // Flatten for keyboard nav
    const flatVisibleNodes: { type: 'file'|'dir', name: string, fullPath: string, level: number, isExpanded?: boolean, originalPath?: string }[] = [];
    
    const buildFlatList = (node: any, pathSoFar: string = '', level: number = 0) => {
      // Sort keys of node if needed, but since we inserted sorted it's partially okay. 
      // JavaScript object keys iteration order is insertion order for strings.
      const entries = Object.entries(node);
      for (const [key, value] of entries) {
        const currentPath = pathSoFar ? `${pathSoFar}/${key}` : key;
        if (typeof value === 'string') {
          flatVisibleNodes.push({ type: 'file', name: key, fullPath: currentPath, level, originalPath: value });
        } else {
          const isExp = expandedFolders.has(currentPath) || !!fileSearchQuery; // auto expand if searching
          flatVisibleNodes.push({ type: 'dir', name: key, fullPath: currentPath, level, isExpanded: isExp });
          if (isExp) {
            buildFlatList(value, currentPath, level + 1);
          }
        }
      }
    };
    buildFlatList(root);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!flatVisibleNodes.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedNodeIndex(prev => Math.min(prev + 1, flatVisibleNodes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedNodeIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const node = flatVisibleNodes[focusedNodeIndex];
        if (node) {
          if (node.type === 'file' && node.originalPath) {
            setPreviewFilePath(null);
            setSelectedFilePath(node.originalPath);
          } else if (node.type === 'dir') {
            toggleFolder(node.fullPath);
          }
        }
      }
    };

    const highlightMatch = (text: string) => {
      if (!fileSearchQuery) return <span>{text}</span>;
      const lowerText = text.toLowerCase();
      const lowerQuery = fileSearchQuery.toLowerCase();
      const idx = lowerText.indexOf(lowerQuery);
      if (idx === -1) return <span>{text}</span>;
      
      return (
        <span>
          {text.slice(0, idx)}
          <mark className="bg-yellow-500/80 text-slate-900 rounded-sm">{text.slice(idx, idx + fileSearchQuery.length)}</mark>
          {text.slice(idx + fileSearchQuery.length)}
        </span>
      );
    };

    return (
      <div 
        className="flex flex-col pb-4 outline-none focus:outline-none" 
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {flatVisibleNodes.map((node, i) => {
          const isFocused = i === focusedNodeIndex;
          
          if (node.type === 'file') {
            const isSelected = selectedFilePath === node.originalPath;
            const isPreview = previewFilePath === node.originalPath;
            
            return (
              <div 
                key={`file-${node.fullPath}`}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded cursor-pointer text-sm select-none",
                  isSelected ? "bg-slate-800 text-blue-400" : isPreview ? "text-blue-300 italic" : "text-slate-300",
                  isFocused && "ring-1 ring-blue-500 bg-slate-800/80"
                )}
                style={{ paddingLeft: `${node.level * 12 + 8}px` }}
                onClick={() => {
                  setFocusedNodeIndex(i);
                  setPreviewFilePath(node.originalPath!);
                }}
                onDoubleClick={() => {
                  setPreviewFilePath(null);
                  setSelectedFilePath(node.originalPath!);
                }}
              >
                {node.name.match(/\.(png|jpe?g|gif|svg|webp)$/i) ? (
                  <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : node.name.match(/\.(html|css|js|ts|jsx|tsx|json)$/i) ? (
                  <Code className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{highlightMatch(node.name)}</span>
              </div>
            );
          } else {
            return (
              <div 
                key={`dir-${node.fullPath}`}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded cursor-pointer text-sm text-slate-400 select-none",
                  isFocused && "ring-1 ring-blue-500 bg-slate-800/80"
                )}
                style={{ paddingLeft: `${node.level * 12 + 8}px` }}
                onClick={() => {
                  setFocusedNodeIndex(i);
                  toggleFolder(node.fullPath);
                }}
              >
                {node.isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                <Folder className={cn("w-4 h-4 shrink-0", node.isExpanded ? "text-amber-400" : "text-slate-500")} />
                <span className="truncate">{highlightMatch(node.name)}</span>
              </div>
            );
          }
        })}
      </div>
    );
  };
"""

pattern = re.compile(r"  // Tree rendering.*?return <div className=\"flex flex-col pb-4\">\{renderNode\(root\)\}</div>;\n  };\n", re.DOTALL)
content = pattern.sub(tree_logic + "\n", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

