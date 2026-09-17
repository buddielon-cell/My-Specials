import re
with open('src/fdtd.worker.ts', 'r') as f:
    worker = f.read()

worker = worker.replace("self.postMessage({ type: 'INIT_DONE', dt });", "(postMessage as any)({ type: 'INIT_DONE', dt });")
worker = worker.replace("self.postMessage({ type: 'STEP_DONE', ez: ez.buffer, step }, [ez.buffer.slice(0)]);", "(postMessage as any)({ type: 'STEP_DONE', ez: ez.buffer, step }, [ez.buffer.slice(0)]);")
worker = worker.replace("self.postMessage({ type: 'EPS_DATA', eps: eps.buffer }, [eps.buffer.slice(0)]);", "(postMessage as any)({ type: 'EPS_DATA', eps: eps.buffer }, [eps.buffer.slice(0)]);")

with open('src/fdtd.worker.ts', 'w') as f:
    f.write(worker)

print("Fixed worker.")
