import re
with open('src/fdtd.worker.ts', 'r') as f:
    worker = f.read()

new_worker = """import { FDTDEngine } from './engines/fdtd';

let engine: FDTDEngine;
let sourcePos = { x: 50, y: 50 };
let sourceType = 'Continuous Wave';
let sourceFreq = 2e14;
let nx = 100;
let ny = 100;

self.onmessage = (e) => {
    if (e.data.type === 'INIT') {
        const config = e.data.config;
        nx = config.nx || 100;
        ny = config.ny || 100;
        const dx = config.dx || 1e-8;
        const dy = config.dy || 1e-8;
        
        engine = new FDTDEngine(nx, ny, dx, dy);
        
        // build lattice
        if (config.lattice) {
            const { a, r, epsRod, epsBg, type, defect } = config.lattice;
            for (let i = 0; i < nx; i++) {
                for (let j = 0; j < ny; j++) {
                    let x = i * dx;
                    let y = j * dy;
                    
                    let rodI = Math.round(x / a);
                    let rodJ = Math.round(y / a);
                    
                    // Simple hexagonal adjustment
                    if (type === 'triangular') {
                        rodJ = Math.round(y / (a * Math.sqrt(3)/2));
                        rodI = Math.round((x - (rodJ % 2) * a/2) / a);
                    }
                    
                    let cx = rodI * a + (type === 'triangular' ? (rodJ % 2) * a/2 : 0);
                    let cy = rodJ * (type === 'triangular' ? a * Math.sqrt(3)/2 : a);
                    
                    let isDefect = false;
                    if (defect === 'point' && rodI === Math.floor((nx*dx/2)/a) && rodJ === Math.floor((ny*dy/2)/a)) isDefect = true;
                    if (defect === 'line' && rodI === Math.floor((nx*dx/2)/a)) isDefect = true;
                    
                    if (!isDefect && (x - cx)**2 + (y - cy)**2 < r**2) {
                        engine.eps[i + j*nx] = engine.eps0 * epsRod;
                    } else {
                        engine.eps[i + j*nx] = engine.eps0 * epsBg;
                    }
                }
            }
        }
        
        sourcePos = config.sourcePos || { x: Math.floor(nx/2), y: Math.floor(ny/2) };
        sourceType = config.sourceType || 'Continuous Wave';
        sourceFreq = config.sourceFreq || 2e14;
        
        (postMessage as any)({ type: 'INIT_DONE', dt: engine.dt });
    } else if (e.data.type === 'STEP') {
        let steps = e.data.steps || 1;
        for(let i=0; i<steps; i++) {
            engine.update(sourcePos, sourceType, sourceFreq);
        }
        // Send back Ez slice
        (postMessage as any)({ type: 'STEP_DONE', ez: engine.ez.buffer, step: engine.step }, [engine.ez.buffer.slice(0)]);
    } else if (e.data.type === 'GET_EPS') {
        (postMessage as any)({ type: 'EPS_DATA', eps: engine.eps.buffer }, [engine.eps.buffer.slice(0)]);
    }
};
"""

with open('src/fdtd.worker.ts', 'w') as f:
    f.write(new_worker)
print("Updated worker to use engine.")
