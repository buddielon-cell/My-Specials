export type SubsystemStatus = 'REAL' | 'SIMULATED' | 'UNAVAILABLE' | 'DEGRADED';

export interface SubsystemHealth {
  id: string;
  name: string;
  status: SubsystemStatus;
  version: string;
  lastHeartbeat: number;
  currentOperation?: string;
  errorState?: string;
}

export class RuntimeTruthLayer {
  private subsystems: Map<string, SubsystemHealth> = new Map();

  constructor() {
    this.register('model_router', 'Model Routing Fabric', 'REAL', '1.0');
    this.register('ollama_local', 'Ollama Local Integration', 'UNAVAILABLE', '1.0');
    this.register('job_queue', 'Persistent Job System', 'SIMULATED', '0.1'); // Phase 2
    this.register('hre_boundary', 'HRE Execution Boundary', 'SIMULATED', '0.1'); // Phase 3
    this.register('governance', 'Governance Hard Gate', 'SIMULATED', '0.1'); // Phase 4
    this.register('airs', 'AIRS Experiment Runner', 'SIMULATED', '0.1'); // Phase 5
    this.register('transcendence', 'Transcendence Lattice', 'SIMULATED', '0.1'); // Phase 6
  }

  register(id: string, name: string, status: SubsystemStatus, version: string) {
    this.subsystems.set(id, {
      id,
      name,
      status,
      version,
      lastHeartbeat: Date.now()
    });
  }

  update(id: string, updates: Partial<SubsystemHealth>) {
    const sys = this.subsystems.get(id);
    if (sys) {
      this.subsystems.set(id, { ...sys, ...updates, lastHeartbeat: Date.now() });
    }
  }

  get(id: string): SubsystemHealth | undefined {
    return this.subsystems.get(id);
  }

  getAll(): SubsystemHealth[] {
    return Array.from(this.subsystems.values());
  }
}

export const aeonRuntime = new RuntimeTruthLayer();
