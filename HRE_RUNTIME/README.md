# BUDDIE AEON UNIVERSAL RUNTIME ENGINE (HRE)
=============================================================================
Universal Intelligence, Research Daemon, Builder Core, and Governance Platform.

## Architecture
- `core/runtime-kernel.mjs`: Event loop, memory registers, task lifecycle, and plugin hooks.
- `governance/policy.mjs`: Inviolable AEON Constitution, 10 human-first rules, privilege gating.
- `research-engine/manager.mjs`: Multi-hour autonomous research loop, 8 specialist roles.
- `runtime/index.mjs`: Central Hardware Runtime Execution (HRE) engine entry point.
- `runtime/doctor.mjs`: System diagnostics, environment auditor, and health verification.
- `runtime/cli.mjs`: Command-line interface for headless and Termux operation.
- `model-router/ollama.mjs`: Local model routing for Ollama / Termux offline models.
- `supervisor/index.mjs`: Process supervisor with wake-lock support for Android / Termux.
- `state/`: Persistent JSON/JSONL records for agents, tasks, research, evidence, and audit receipts.

## Execution
Run under Termux on Android or any Node.js environment:
```bash
node runtime/index.mjs
```
