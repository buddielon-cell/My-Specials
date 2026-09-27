/**
 * BUDDIE AEON Universal Runtime Entry Point
 */
import { kernel } from '../core/runtime-kernel.mjs';
import { CONSTITUTION_RULES } from '../governance/policy.mjs';
import { researchManager } from '../research-engine/manager.mjs';

console.log("==================================================================");
console.log("   BUDDIE AEON UNIVERSAL HARDWARE/RUNTIME EXECUTION (HRE) ENGINE   ");
console.log("   Version 2.2.0 | Operational Governance: Active                 ");
console.log("==================================================================");

async function main() {
  await kernel.initialize();
  console.log("[HRE] Runtime Kernel Initialized. Uptime:", kernel.getUptime(), "seconds");
  console.log("[HRE] Governance Constitution loaded with", CONSTITUTION_RULES.length, "inviolable rules.");
  console.log("[HRE] Research Engine Manager standby. Ready for execution.");
}

main().catch(err => {
  console.error("[HRE] Fatal Runtime Error:", err);
  process.exit(1);
});
