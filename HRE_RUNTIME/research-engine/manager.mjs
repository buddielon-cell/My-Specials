/**
 * AEON Research Engine Manager
 * Coordinates multi-hour specialist investigations across rotating roles.
 */
export const SPECIALIST_ROLES = [
  'literature_researcher',
  'hypothesis_generator',
  'adversarial_researcher',
  'experiment_designer',
  'evidence_analyst',
  'cross_validator',
  'synthesis_agent',
  'research_auditor'
];

export class ResearchManager {
  constructor(options = {}) {
    this.options = options;
    this.jobs = new Map();
  }

  createJob(objective, maxHours = 4) {
    const id = 'job_' + Date.now();
    const job = {
      id,
      objective,
      status: 'RUNNING',
      maxHours,
      roleIndex: 0,
      hypotheses: [],
      branches: [],
      sources: [],
      findings: [],
      createdAt: new Date().toISOString()
    };
    this.jobs.set(id, job);
    return job;
  }

  getJob(id) {
    return this.jobs.get(id) || null;
  }
}

export const researchManager = new ResearchManager();
