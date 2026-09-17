export type MachineType = 'Cutter' | 'Stitcher' | 'Hemmer' | 'Inspector';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: 'idle' | 'working';
  currentTaskId: string | null;
  outputCount: number;
  efficiency: number;
  avgTime: number;
}

export interface Task {
  id: string;
  name: string;
  directives: Record<string, string>;
  stage: MachineType;
  status: 'queued' | 'in_progress' | 'completed';
  progress: number;
  createdAt: number;
}

export interface FactoryLog {
  id: string;
  timestamp: number;
  machineId: string;
  taskId: string;
  details: string;
}

export interface MetricPoint {
  time: string;
  avgTime: number;
  efficiency: number;
}

export class FactoryEngine {
  machines: Machine[] = [
    { id: 'M-CUT-1', name: 'Laser Cutter A', type: 'Cutter', status: 'idle', currentTaskId: null, outputCount: 0, efficiency: 95, avgTime: 12 },
    { id: 'M-CUT-2', name: 'Laser Cutter B', type: 'Cutter', status: 'idle', currentTaskId: null, outputCount: 0, efficiency: 92, avgTime: 14 },
    { id: 'M-STC-1', name: 'Auto Stitcher A', type: 'Stitcher', status: 'idle', currentTaskId: null, outputCount: 0, efficiency: 88, avgTime: 25 },
    { id: 'M-STC-2', name: 'Auto Stitcher B', type: 'Stitcher', status: 'idle', currentTaskId: null, outputCount: 0, efficiency: 90, avgTime: 22 },
    { id: 'M-HEM-1', name: 'Hemmer Unit A', type: 'Hemmer', status: 'idle', currentTaskId: null, outputCount: 0, efficiency: 94, avgTime: 18 },
    { id: 'M-INS-1', name: 'Vision Inspector', type: 'Inspector', status: 'idle', currentTaskId: null, outputCount: 0, efficiency: 99, avgTime: 5 },
  ];
  
  tasks: Task[] = [];
  logs: FactoryLog[] = [];
  metrics: MetricPoint[] = [];
  
  private listeners: (() => void)[] = [];
  private tickInterval: any;
  private timeStep = 0;

  constructor() {
    this.start();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  start() {
    if (!this.tickInterval) {
      this.tickInterval = setInterval(() => this.tick(), 1000);
    }
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  addTasks(newTasks: Task[]) {
    this.tasks.push(...newTasks);
    this.notify();
  }

  addLog(machineId: string, taskId: string, details: string) {
    this.logs.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      machineId,
      taskId,
      details
    });
  }

  tick() {
    this.timeStep++;
    let stateChanged = false;

    const STAGE_ORDER: MachineType[] = ['Cutter', 'Stitcher', 'Hemmer', 'Inspector'];

    for (const machine of this.machines) {
      if (machine.status === 'idle') {
        const pendingTask = this.tasks.find(t => t.status === 'queued' && t.stage === machine.type);
        if (pendingTask) {
          pendingTask.status = 'in_progress';
          machine.status = 'working';
          machine.currentTaskId = pendingTask.id;
          const directive = pendingTask.directives[machine.type] || 'Standard processing';
          this.addLog(machine.id, pendingTask.id, `Started processing task on ${machine.name}. Directive: ${directive}`);
          stateChanged = true;
        }
      } else if (machine.status === 'working' && machine.currentTaskId) {
        const task = this.tasks.find(t => t.id === machine.currentTaskId);
        if (task) {
          task.progress += Math.random() * 25 + 15; // 15-40% per tick
          if (task.progress >= 100) {
            task.progress = 0;
            machine.outputCount++;
            
            const currentStageIdx = STAGE_ORDER.indexOf(task.stage);
            if (currentStageIdx === STAGE_ORDER.length - 1) {
              task.status = 'completed';
              this.addLog(machine.id, task.id, `Task fully completed and passed inspection.`);
            } else {
              task.status = 'queued';
              task.stage = STAGE_ORDER[currentStageIdx + 1];
              this.addLog(machine.id, task.id, `Completed ${machine.type} stage. Handed off to ${task.stage} queue.`);
            }
            
            machine.status = 'idle';
            machine.currentTaskId = null;
            
            machine.efficiency = Math.max(70, Math.min(100, machine.efficiency + (Math.random() * 4 - 2)));
            machine.avgTime = Math.max(5, machine.avgTime + (Math.random() * 2 - 1));
          }
          stateChanged = true;
        }
      }
    }

    if (this.timeStep % 5 === 0) {
      const avgEff = this.machines.reduce((acc, m) => acc + m.efficiency, 0) / this.machines.length;
      const avgTime = this.machines.reduce((acc, m) => acc + m.avgTime, 0) / this.machines.length;
      this.metrics.push({
        time: new Date().toLocaleTimeString([], {minute: '2-digit', second:'2-digit'}),
        avgTime: parseFloat(avgTime.toFixed(1)),
        efficiency: parseFloat(avgEff.toFixed(1))
      });
      if (this.metrics.length > 20) this.metrics.shift();
      stateChanged = true;
    }

    if (stateChanged) {
      this.notify();
    }
  }
}

export const factoryEngine = new FactoryEngine();
