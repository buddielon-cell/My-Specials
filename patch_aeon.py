import re

with open('src/engines/aeon.ts', 'r') as f:
    content = f.read()

# Add llmCaller to AEONCore
new_aeon_core = """// AEON Core
export type LLMCaller = (prompt: string) => Promise<string>;
export type VFSAction = (filepath: string, content: string) => void;

export class AEONCore {
  state: string = 'IDLE';
  objective: string | null = null;
  plan: string | null = null;
  llmProvider: LLMCaller | null = null;
  vfsWriter: VFSAction | null = null;

  attach(llm: LLMCaller, vfs: VFSAction) {
    this.llmProvider = llm;
    this.vfsWriter = vfs;
  }

  async setObjective(obj: string) {
    this.objective = obj;
    this.state = 'INTENT_RECEIVED';
    aeonBus.emit('intent.created', 'AEON', { objective: obj });
    
    if (!this.llmProvider) {
       console.warn("AEONCore running in simulation mode. Attach providers for real execution.");
       // ... fallback simulation logic ...
       setTimeout(() => {
         this.state = 'RESEARCHING';
         this.plan = 'Analyze system capabilities and propose optimization.';
         aeonBus.emit('plan.created', 'AEON', { plan: this.plan });
         const expId = airsEngine.startExperiment('Optimize execution pipeline', 'Refactoring state machine reduces latency', 'Simulate concurrent tasks');
         const sub = aeonBus.subscribe(ev => {
           if (ev.type === 'evidence.created' && ev.payload.experiment_id === expId) {
             sub();
             this.state = 'PROPOSAL_CREATED';
             const prop = governanceEngine.submitProposal('Pipeline Optimization', 'Reduce latency', airsEngine.evidence, 'Deploy concurrent state machine', 'R2');
             setTimeout(() => {
                governanceEngine.evaluateProposal(prop.id, true);
                const auth = governanceEngine.authorizations[0];
                this.state = 'QUEUED_FOR_HRE';
                hreEngine.execute(prop.id, auth.id, 'system_command', 'R2');
             }, 2000);
           }
         });
       }, 1500);
       return;
    }

    try {
      this.state = 'RESEARCHING';
      
      // Step 1: AEON Formulates a real plan
      const planRes = await this.llmProvider(`You are AEON, an autonomous builder. Objective: "${obj}". Provide a 3-step technical execution plan. Keep it concise.`);
      this.plan = planRes || "Synthesize architecture to fulfill objective.";
      aeonBus.emit('plan.created', 'AEON', { plan: this.plan });

      // Step 2: AIRS runs real evaluation
      const expId = airsEngine.startExperiment('Objective Realization Analysis', 'LLM generative fulfillment', 'Zero-shot execution');
      
      const sub = aeonBus.subscribe(async (ev) => {
        if (ev.type === 'evidence.created' && ev.payload.experiment_id === expId) {
          sub();
          this.state = 'PROPOSAL_CREATED';
          
          // Generate actual code payload (the proposed change)
          const codePrompt = `Write the code to fulfill this objective: "${obj}". Return only raw code, no markdown block if possible, or simple markdown.`;
          const proposedCode = await this.llmProvider!(codePrompt);

          const prop = governanceEngine.submitProposal(
            'Objective Implementation',
            obj,
            airsEngine.evidence,
            proposedCode,
            'R2'
          );

          // Auto-approve in Sandbox
          governanceEngine.evaluateProposal(prop.id, true);
          const auth = governanceEngine.authorizations[0];
          this.state = 'QUEUED_FOR_HRE';
          
          // Pass the VFS writer to HRE
          hreEngine.executeReal(prop.id, auth.id, 'file_operation', 'R2', this.vfsWriter!);
        }
      });
    } catch (err: any) {
      this.state = 'FAILED';
      aeonBus.emit('execution.failed', 'AEON', { error: err.message });
    }
  }
}
export const aeonCore = new AEONCore();"""

content = re.sub(r'// AEON Core.*?export const aeonCore = new AEONCore\(\);', new_aeon_core, content, flags=re.DOTALL)

with open('src/engines/aeon.ts', 'w') as f:
    f.write(content)
