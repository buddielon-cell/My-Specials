/**
 * AEON Universal Process Supervisor
 * Keeps background research and model polling alive under Termux / Desktop.
 */
import { spawn } from 'child_process';

console.log("[SUPERVISOR] Starting AEON Universal Watchdog...");

function monitorProcess() {
  const child = spawn('node', ['research-engine/manager.mjs'], { stdio: 'inherit' });
  child.on('exit', (code) => {
    console.warn("[SUPERVISOR] Worker exited with code", code, "- restarting in 2 seconds...");
    setTimeout(monitorProcess, 2000);
  });
}

monitorProcess();
