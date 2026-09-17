export type MachineState = 'IDLE' | 'QUEUED' | 'PREPARING' | 'RUNNING' | 'PAUSED' | 'QUALITY_CHECK' | 'MAINTENANCE' | 'FAULT' | 'OFFLINE' | 'COMPLETED';

export interface AdvancedMachine {
  id: string;
  name: string;
  type: string;
  state: MachineState;
  currentJobId: string | null;
  productionCount: number;
  utilization: number;
  cycleTimeMs: number;
  speed: number;
  temperature: number;
  vibration: number;
  faultLog: string[];
  energyUsage: number;
  queue: string[];
  telemetryHistory: {time: string, temp: number, vib: number}[];
  activeTicks?: number;
  totalTicks?: number;
  productionHistory?: {time: string, count: number}[];
  stateTicks?: number;
  maintenanceRisk: number;
}

export interface GarmentTwin {
  id: string;
  designId: string;
  size: string;
  fabricBatch: string;
  stage: string; // DESIGN, PATTERN, CUT, ASSEMBLY, SEWING, QA, FINISHING, PACKAGING, COMPLETED, REWORK
  assignedMachine: string | null;
  qualityHistory: string[];
  completionPercent: number;
  estimatedCompletion: number | null;
}

export interface FactoryEvent {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  source: string;
}

export interface Order {
  id: string;
  product: string;
  size: string;
  quantity: number;
  fabric: string;
  priority: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export class AdvancedFactoryEngine {
  machines: AdvancedMachine[] = [];
  garments: GarmentTwin[] = [];
  orders: Order[] = [];
  events: FactoryEvent[] = [];
  simulationSpeed: number = 1;
  isRunning: boolean = false;
  metrics = {
    throughput: 0,
    waste: 0,
    qualityPassRate: 100,
    averageCycleTime: 0
  };
  
  private listeners: (() => void)[] = [];
  private tickInterval: any;
  public tickCount: number = 0;

  constructor() {
    this.initMachines();
  }

  initMachines() {
    const types = [
      { id: 'M-01', name: 'Lockstitch 1', type: 'Lockstitch' },
      { id: 'M-02', name: 'Overlock 1', type: 'Overlock' },
      { id: 'M-03', name: 'Coverstitch 1', type: 'Coverstitch' },
      { id: 'M-04', name: 'Buttonhole', type: 'Buttonhole' },
      { id: 'M-05', name: 'Button Attach', type: 'ButtonAttachment' },
      { id: 'M-06', name: 'Auto Cutter', type: 'Cutting' },
      { id: 'M-07', name: 'Fabric Inspect', type: 'Inspection' },
      { id: 'M-08', name: 'Robotic Handler', type: 'Handling' },
      { id: 'M-09', name: 'Auto Press', type: 'Finishing' },
      { id: 'M-10', name: 'AI Vision QA', type: 'VisionQA' },
    ];
    this.machines = types.map(t => ({
      ...t,
      state: 'IDLE',
      currentJobId: null,
      productionCount: 0,
      utilization: 0,
      cycleTimeMs: 15000,
      speed: 100,
      temperature: 45,
      vibration: 0.1,
      faultLog: [],
      energyUsage: 0,
      queue: [],
      telemetryHistory: [],
      activeTicks: 0,
      totalTicks: 0,
      productionHistory: [],
      maintenanceRisk: 0.05
    }));
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  logEvent(source: string, type: string, message: string) {
    this.events.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type, message, source
    });
    if (this.events.length > 100) this.events.pop();
  }

  setSpeed(speed: number) {
    this.simulationSpeed = speed;
    if (this.isRunning) {
      this.pause();
      this.start();
    }
  }

  start() {
    if (this.tickInterval) return;
    this.isRunning = true;
    this.tickInterval = setInterval(() => this.tick(), 1000 / this.simulationSpeed);
    this.logEvent('SYSTEM', 'INFO', `Simulation started at ${this.simulationSpeed}x speed.`);
    this.notify();
  }

  pause() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.isRunning = false;
    this.logEvent('SYSTEM', 'INFO', 'Simulation paused.');
    this.notify();
  }

  reset() {
    this.pause();
    this.initMachines();
    this.garments = [];
    this.orders = [];
    this.events = [];
    this.metrics = { throughput: 0, waste: 0, qualityPassRate: 100, averageCycleTime: 0 };
    this.tickCount = 0;
    this.logEvent('SYSTEM', 'INFO', 'Factory reset to initial state.');
    this.notify();
  }

  placeOrder(orderParams: any) {
    const order: Order = {
      id: orderParams.id || `ORD-${Math.floor(Math.random()*1000)}`,
      product: orderParams.product || 'Garment',
      size: orderParams.size || 'M',
      quantity: orderParams.quantity || 1,
      fabric: orderParams.fabric || 'Cotton',
      priority: orderParams.priority || 'NORMAL',
      status: 'PENDING'
    };
    this.orders.push(order);
    this.logEvent('LOOM MIND', 'ORDER', `Order ${order.id} received for ${order.quantity}x ${order.product}.`);
    this.notify();
  }

  emergencyStop(machineId: string) {
    const m = this.machines.find(m => m.id === machineId);
    if (m) {
      m.state = 'FAULT';
      m.vibration += 10;
      m.temperature += 20;
      this.logEvent('FACTORY MANAGEMENT', 'CRITICAL', `EMERGENCY STOP triggered for ${m.name} (${m.id})! Halting production.`);
      if (typeof window !== 'undefined' && 'Notification' in window) { if (Notification.permission === 'granted') { new Notification(`E-STOP: ${m.name}`, { body: 'Emergency Stop Activated' }); } }
      
      if (m.currentJobId) {
         const g = this.garments.find(g => g.id === m.currentJobId);
         if (g) g.assignedMachine = null;
         m.currentJobId = null;
      }
      m.queue.forEach(gid => {
         const g = this.garments.find(g => g.id === gid);
         if (g) g.assignedMachine = null;
      });
      m.queue = [];
      this.notify();
    }
  }

  reorderQueue(machineId: string, startIndex: number, endIndex: number) {
    const m = this.machines.find(m => m.id === machineId);
    if (m) {
      const [removed] = m.queue.splice(startIndex, 1);
      m.queue.splice(endIndex, 0, removed);
      this.notify();
    }
  }

  simulateFault(machineId: string) {
    const triggerNotif = (mName: string, error: string) => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`Factory Fault: ${mName}`, { body: error });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(p => {
            if (p === 'granted') new Notification(`Factory Fault: ${mName}`, { body: error });
          });
        }
      }
    };
    const m = this.machines.find(m => m.id === machineId);
    if (m) {
      m.state = 'FAULT';
      m.vibration += Math.random() * 5 + 5;
      m.temperature += Math.random() * 20 + 20;
      this.logEvent('LOOM MIND', 'FAULT', `Machine ${m.id} (${m.name}) reported a critical fault!`);
      triggerNotif(m.name, 'Critical Fault Detected!');
      
      // If it had a job, reroute it
      if (m.currentJobId) {
         const g = this.garments.find(g => g.id === m.currentJobId);
         if (g) {
            g.assignedMachine = null;
            this.logEvent('LOOM MIND', 'REROUTE', `Garment ${g.id} suspended from ${m.id} due to fault.`);
         }
         m.currentJobId = null;
      }
      this.notify();
    }
  }

  requestMaintenance(machineId: string) {
    const m = this.machines.find(m => m.id === machineId);
    if (m && m.state !== 'MAINTENANCE') {
       m.state = 'MAINTENANCE';
       this.logEvent('SYSTEM', 'MAINTENANCE', `Maintenance requested for ${m.id}.`);
       this.notify();
    }
  }

  recoverMachine(machineId: string) {
    const m = this.machines.find(m => m.id === machineId);
    if (m) {
       m.state = 'IDLE';
       m.vibration = 0.1;
       m.temperature = 45;
       m.maintenanceRisk = 0;
       this.logEvent('SYSTEM', 'RECOVER', `Machine ${m.id} recovered and is back online.`);
       this.notify();
    }
  }

  tick() {
    this.tickCount++;
    let stateChanged = false;

    // 1. Order Processing (Loom Mind)
    for (const order of this.orders.filter(o => o.status === 'PENDING')) {
      order.status = 'IN_PROGRESS';
      this.logEvent('LOOM MIND', 'PLANNING', `Generated production plan for ${order.id}. Reserving material...`);
      for (let i=0; i<order.quantity; i++) {
        this.garments = [...this.garments, {
          id: `G-${order.id}-${i+1}`,
          designId: order.product,
          size: order.size,
          fabricBatch: `FB-${Math.floor(Math.random()*1000)}`,
          stage: 'DESIGN',
          assignedMachine: null,
          qualityHistory: [],
          completionPercent: 0,
          estimatedCompletion: null
        }];
      }
      stateChanged = true;
    }

    // 2. Garment progression logic
    const stages = ['DESIGN', 'PATTERN', 'CUT', 'ASSEMBLY', 'SEWING', 'QA', 'FINISHING', 'PACKAGING', 'COMPLETED'];
    const machineStageMap: Record<string, string[]> = {
      'Cutting': ['CUT'],
      'Handling': ['ASSEMBLY'],
      'Lockstitch': ['SEWING'],
      'Overlock': ['SEWING'],
      'Coverstitch': ['SEWING'],
      'VisionQA': ['QA'],
      'Finishing': ['FINISHING'],
    };

    for (const garment of this.garments.filter(g => g.stage !== 'COMPLETED' && g.stage !== 'REWORK')) {
      const currentStageIdx = stages.indexOf(garment.stage);
      
      // Auto-progress early stages quickly
      if (['DESIGN', 'PATTERN', 'PACKAGING'].includes(garment.stage)) {
         garment.completionPercent += 20;
         if (garment.completionPercent >= 100) {
            garment.completionPercent = 0;
            garment.stage = stages[currentStageIdx + 1];
            this.logEvent('LOOM MIND', 'PROGRESS', `Garment ${garment.id} completed ${stages[currentStageIdx]} stage.`);
         }
         stateChanged = true;
         continue;
      }

      // If it needs a machine but has none
      if (!garment.assignedMachine) {
         const suitableMachines = this.machines.filter(m => 
            machineStageMap[m.type]?.includes(garment.stage) && m.queue.length < 10 && m.state !== 'FAULT' && m.state !== 'OFFLINE' && m.state !== 'MAINTENANCE'
         );
         
         if (suitableMachines.length > 0) {
            suitableMachines.sort((a,b) => (a.queue.length - b.queue.length) || (a.maintenanceRisk - b.maintenanceRisk));
            const m = suitableMachines[0];
            m.queue.push(garment.id);
            garment.assignedMachine = m.id;
            this.logEvent('LOOM MIND', 'ASSIGN', `Garment ${garment.id} assigned to queue of ${m.id} for ${garment.stage}.`);
            stateChanged = true;
         }
      }
    }

    // 3. Machine execution
    for (const machine of this.machines) {
      machine.totalTicks = (machine.totalTicks || 0) + 1;
      if (machine.state === 'RUNNING' || machine.state === 'PREPARING' || machine.state === 'COMPLETED') {
         machine.activeTicks = (machine.activeTicks || 0) + 1;
      }
      if (machine.totalTicks > 100) {
         machine.totalTicks = 50;
         machine.activeTicks = Math.floor((machine.activeTicks || 0) / 2);
      }
      machine.utilization = ((machine.activeTicks || 0) / Math.max(1, machine.totalTicks)) * 100;
      
      if (this.tickCount % 5 === 0) {
         if (!machine.productionHistory) machine.productionHistory = [];
         machine.productionHistory.push({ time: new Date().toLocaleTimeString(), count: machine.productionCount });
         if (machine.productionHistory.length > 20) machine.productionHistory.shift();
      }

      if (machine.state === 'COMPLETED') {
         machine.stateTicks = (machine.stateTicks || 0) + 1;
         if (machine.stateTicks >= 2) {
            machine.state = 'IDLE';
            machine.stateTicks = 0;
         }
         stateChanged = true;
      } else if (machine.state === 'IDLE' && machine.queue.length > 0) {
         machine.currentJobId = machine.queue.shift() || null;
         machine.state = 'PREPARING';
         stateChanged = true;
      } else if (machine.state === 'PREPARING') {
         machine.state = 'RUNNING';
         stateChanged = true;
      } else if (machine.state === 'RUNNING' && machine.currentJobId) {
         machine.temperature += 0.5;
         machine.vibration += 0.05;
         machine.energyUsage += 1.2;
         machine.maintenanceRisk += 0.001;

         const garment = this.garments.find(g => g.id === machine.currentJobId);
         if (garment) {
            garment.completionPercent += 10;
            if (garment.completionPercent >= 100) {
               // Complete operation
               garment.completionPercent = 0;
               machine.productionCount++;
               
               // QA Logic
               if (machine.type === 'VisionQA') {
                  const pass = Math.random() > 0.15; // 85% pass rate
                  if (pass) {
                     garment.stage = 'FINISHING';
                     garment.qualityHistory.push('PASS');
                     this.logEvent('QA', 'PASS', `Garment ${garment.id} passed quality inspection.`);
                  } else {
                     garment.stage = 'REWORK';
                     garment.qualityHistory.push('FAIL');
                     this.logEvent('QA', 'FAIL', `Garment ${garment.id} failed inspection! Routing to rework.`);
                     this.metrics.waste += 0.5;
                  }
               } else {
                 const currentStageIdx = stages.indexOf(garment.stage);
                 garment.stage = stages[currentStageIdx + 1];
               }

               garment.assignedMachine = null;
               machine.currentJobId = null;
               machine.state = 'COMPLETED';
               machine.stateTicks = 0;
               this.logEvent('MACHINE AGENT', 'COMPLETED', `Machine ${machine.id} completed operation.`);
            }
         } else {
           machine.currentJobId = null;
           machine.state = 'IDLE';
         }
         stateChanged = true;
      } else if (machine.state === 'MAINTENANCE') {
         machine.maintenanceRisk -= 0.1;
         if (machine.maintenanceRisk <= 0) {
           machine.maintenanceRisk = 0;
           machine.state = 'IDLE';
           machine.temperature = 45;
           machine.vibration = 0.1;
           this.logEvent('SYSTEM', 'MAINTENANCE', `Maintenance completed for ${machine.id}.`);
         }
         stateChanged = true;
      }

      // Telemetry recording
      if (this.tickCount % 2 === 0) {
         machine.telemetryHistory.push({
            time: new Date().toLocaleTimeString([], {minute: '2-digit', second:'2-digit'}),
            temp: machine.temperature,
            vib: machine.vibration
         });
         if (machine.telemetryHistory.length > 30) machine.telemetryHistory.shift();
      }

      // Cooling / Recovery
      if (machine.state === 'IDLE' && machine.temperature > 45) {
         machine.temperature -= 0.5;
         stateChanged = true;
      }
      
      // Update utilization metric
      if (this.tickCount % 5 === 0) {
         const busy = this.machines.filter(m => m.state === 'RUNNING' || m.state === 'PREPARING').length;
         this.metrics.throughput = this.garments.filter(g => g.stage === 'COMPLETED').length;
         const totalQA = this.garments.reduce((acc, g) => acc + g.qualityHistory.length, 0);
         const passedQA = this.garments.reduce((acc, g) => acc + g.qualityHistory.filter(q=>q==='PASS').length, 0);
         if (totalQA > 0) this.metrics.qualityPassRate = Math.round((passedQA / totalQA) * 100);
      }
    }

    // Auto-Rework Logic
    for (const garment of this.garments.filter(g => g.stage === 'REWORK')) {
      garment.completionPercent += 10;
      if (garment.completionPercent >= 100) {
        garment.stage = 'QA';
        garment.completionPercent = 0;
        this.logEvent('LOOM MIND', 'REWORK', `Garment ${garment.id} rework finished, returning to QA.`);
        stateChanged = true;
      }
    }
    
    // Check order completion
    for (const order of this.orders.filter(o => o.status === 'IN_PROGRESS')) {
       const orderGarments = this.garments.filter(g => g.id.startsWith(`G-${order.id}`));
       if (orderGarments.length > 0 && orderGarments.every(g => g.stage === 'COMPLETED')) {
          order.status = 'COMPLETED';
          this.logEvent('LOOM MIND', 'ORDER_COMPLETE', `Order ${order.id} fully completed!`);
          stateChanged = true;
       }
    }

    if (stateChanged) this.notify();
  }
}

export const advancedFactoryEngine = new AdvancedFactoryEngine();
