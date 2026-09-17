import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

wrong_code = """  const exportLedgerJson = () => {
    const dataStr = JSON.stringify(ledgerEvents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airs_event_ledger.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const proposalStats = ['DRAFT', 'UNDER_REVIEW', 'AWAITING_HUMAN_APPROVAL', 'HUMAN_APPROVED'].map(status => ({
    name: status.replace(/_/g, ' '), count: proposals.filter(p => p.status === status).length
  }));

  return (
"""
content = content.replace(wrong_code, "    return () => window.removeEventListener('keydown', handleGlobalKeyDown);\n  }, []);\n\n  // Periodic auto-snapshot to local storage every 5 minutes", 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
