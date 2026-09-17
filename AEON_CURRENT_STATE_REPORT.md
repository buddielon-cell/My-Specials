# AEON CURRENT STATE REPORT

## 1. Working components
- Core React Application (`App.tsx`, `main.tsx`)
- Virtual File System (VFS) with `localStorage` persistence
- UI layout, sidebars, navigation tabs (Aeon Dashboard, AI Core, History, Factory)
- Component diff viewer (`DiffViewer.tsx`)
- Network fetch layer for GitHub push and external requests (partially in `server.ts`)
- The terminal UI and syntax highlighting components

## 2. Partially working components
- `EventBus` (`aeon.ts`): Functions correctly for emitting events, but operates entirely in-memory without persistence.
- `MemoryBank`: Exists and records events, but is not persisted across reloads.
- Firebase integration: Initialized but underutilized.

## 3. Simulated components
- **AIRSEngine**: Uses `setTimeout` to mock experiment execution and synthesize fake results/confidence scores.
- **HREEngine**: Simulates sandbox execution. Returns hardcoded or randomly generated outputs.
- **GovernanceEngine**: Approvals are mocked or auto-completed.
- **Transcendence Lattice**: Visual nodes progress based on timers, not real underlying dependencies or state changes.
- **Workspace Telemetry**: CPU and Memory metrics in the sidebar are randomly generated.

## 4. Missing components
- **Model Router**: No provider-agnostic centralized router (currently hardcoded into `App.tsx`).
- **Continuity Engine**: No capability to resume jobs or handle network failures elegantly.
- **Persistent Job Queue**: No standard `Job` entity, leading to lost operations on reload.
- **Real Evidence System**: Missing canonical evidence ledger with proper epistemic states.
- **Research Engine**: No long-horizon research tracking structure.

## 5. Duplicate components
- Multiple scattered implementations of API calls (`callAI`, `fetchWithTime`, `submitHreCopilot`) inside `App.tsx`.

## 6. Broken integrations
- Offline LLM fallback (`WebLLM`) is brittle and can result in silent failures or "Local API connection failed" loops if misconfigured.

## 7. Security concerns
- Custom API keys are passed over the network in plain text within request bodies (`customApiKey`).
- Missing robust server-side environment variable encapsulation for all providers.

## 8. Persistence weaknesses
- `aeon.ts` stores critical state (`events`, `records`, `experiments`, `proposals`) in volatile arrays. A page refresh wipes out the "operating system" state.

## 9. Model-routing weaknesses
- Routing is completely manual (dropdown selection). No task-aware routing (e.g., sending simple tasks to fast local models and complex reasoning to cloud models).

## 10. HRE weaknesses
- Silent bypasses exist where `App.tsx` modifies the VFS directly without a formal HRE execution receipt or authorization.

## 11. AIRS weaknesses
- Isolated experiments do not actually run independent processes or hit isolated LLM contexts.

## 12. Governance weaknesses
- No hard gate. Production (VFS) mutations are applied synchronously without genuine review/approval staging.

## 13. Research-engine weaknesses
- Unable to sustain long-running mathematical research (like the Riemann Hypothesis mission) due to lack of persistence, checkpointing, and independent agent orchestration.

## 14. Recommended migration order
1. **PHASE 1**: Runtime truth + Model Router + Ollama.
2. **PHASE 2**: Continuity + Persistent Job Queue.
3. **PHASE 3**: HRE bridge + real execution receipts.
4. **PHASE 4**: Governance hard gate + canary + rollback.
5. **PHASE 5**: Real AIRS.
6. **PHASE 6**: Real Lattice state machine.
7. **PHASE 7**: Persistent Research Engine.
8. **PHASE 8**: Master Builder orchestration.
9. **PHASE 9**: Formal verification/reproducibility integrations.
10. **PHASE 10**: Full system hardening.
