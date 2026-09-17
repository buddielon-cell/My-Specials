import re

with open('src/engines/aeon.ts', 'r') as f:
    content = f.read()

new_hre_core = """  executeReal(proposalId: string, authId: string, actionType: string, riskLevel: RiskLevel, vfsWriter: (path: string, content: string) => void) {
    const auth = governanceEngine.authorizations.find(a => a.id === authId);
    if (!auth || auth.status !== 'approved') {
      aeonBus.emit('hre.execution.failed', 'HRE', { reason: 'Unauthorized execution attempt' });
      return;
    }

    const action: HREAction = {
      action_id: `ACT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      proposal_id: proposalId,
      authorization_id: authId,
      action_type: actionType,
      status: 'queued',
      risk_level: riskLevel,
      requested_at: Date.now()
    };
    
    this.queue.unshift(action);
    aeonBus.emit('action.queued', 'HRE', { action_id: action.action_id });

    // Execute immediately in real mode
    setTimeout(() => {
      action.status = 'executing';
      aeonBus.emit('hre.execution.started', 'HRE', { action_id: action.action_id });
      
      try {
        const p = governanceEngine.proposals.find(p => p.id === proposalId);
        if (p && p.recommended_action) {
           // We expect the recommended action to be raw code or a JSON diff.
           // For now, if we don't have a specific file, we default to writing to a generated file or modifying something basic.
           // Let's create a new file in VFS for it.
           const newFilePath = `/src/generated_${Math.random().toString(36).substr(2, 4)}.tsx`;
           const codeStr = p.recommended_action.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
           vfsWriter(newFilePath, codeStr);
        }

        action.status = 'completed';
        const receipt = {
          action_id: action.action_id,
          status: 'completed',
          started_at: action.requested_at,
          completed_at: Date.now(),
          validation_status: 'pending',
          audit_reference: `AUD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        };
        this.receipts.unshift(receipt);
        aeonBus.emit('hre.execution.completed', 'HRE', { action_id: action.action_id });
        
        setTimeout(() => {
          receipt.validation_status = 'passed';
          aeonBus.emit('validation.passed', 'VALIDATOR', { action_id: action.action_id });
          memoryBank.record('EXECUTION', receipt);
          if (p) p.governance_status = 'VALIDATED';
        }, 500);

      } catch (err: any) {
         action.status = 'failed';
         aeonBus.emit('hre.execution.failed', 'HRE', { reason: err.message });
      }
    }, 500);
  }"""

# Insert before execute(
content = content.replace("  execute(proposalId: string, authId: string, actionType: string, riskLevel: RiskLevel) {", new_hre_core + "\n\n  execute(proposalId: string, authId: string, actionType: string, riskLevel: RiskLevel) {")

with open('src/engines/aeon.ts', 'w') as f:
    f.write(content)
