import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace runKnowledgeReindex
reindex_old = "    setIsIndexing(true);\n    setKnowledgeIndex('Generating knowledge index...');"
reindex_new = "    setIsIndexing(true);\n    setKnowledgeIndex('Generating knowledge index...');\n    logEvent('SYSTEM', 'Knowledge Base Re-index Triggered');"
content = content.replace(reindex_old, reindex_new)

# Replace runBuilderUpgradeScan
builder_old = "    setIsBuildingUpgrade(true);\n    try {"
builder_new = "    setIsBuildingUpgrade(true);\n    logEvent('SYSTEM', 'System Builder Upgrade Scan Triggered');\n    try {"
content = content.replace(builder_old, builder_new)

# Replace runDiscoveryAudit
audit_old = "    setIsDiscovering(true);\n    setDiscoveryReport('Scanning repository for technical debt and optimizations...');"
audit_new = "    setIsDiscovering(true);\n    setDiscoveryReport('Scanning repository for technical debt and optimizations...');\n    logEvent('SYSTEM', 'Deep Discovery Audit Triggered');"
content = content.replace(audit_old, audit_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
