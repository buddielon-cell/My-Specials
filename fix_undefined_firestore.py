import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  const syncLogEvent = useCallback(async (type: LedgerEvent['type'], description: string, details?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const eventObj: LedgerEvent = { id, timestamp: Date.now(), type, description, details };
    // Optimistic
    setLedgerEvents(prev => [eventObj, ...prev]);
    // Cloud push
    await setDoc(doc(db, "ledger", id), eventObj).catch(console.error);
  }, []);"""

replacement = """  const syncLogEvent = useCallback(async (type: LedgerEvent['type'], description: string, details?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const eventObj: LedgerEvent = { id, timestamp: Date.now(), type, description };
    if (details !== undefined) {
      eventObj.details = details;
    }
    // Optimistic
    setLedgerEvents(prev => [eventObj, ...prev]);
    // Cloud push
    await setDoc(doc(db, "ledger", id), eventObj).catch(console.error);
  }, []);"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)

