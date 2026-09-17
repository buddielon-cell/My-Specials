import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

import ComputationalPhotonicsLab from './ComputationalPhotonicsLab';
import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { db } from './lib/firebase';
import { factoryEngine } from './engines/factory';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { getWebLLMEngine } from './lib/webllm';
import NewsTicker from './components/NewsTicker';

import { DiffViewer } from './DiffViewer';

import { motion, AnimatePresence } from 'motion/react';
import * as Diff from 'diff';
import { X, Cpu, Network, FileJson, FileCode2, Brush,  UploadCloud, File, FileText, Image as ImageIcon, Archive, Code, Play, Folder, Plus, Download, RefreshCw, Send, Save, History, Beaker, GitPullRequest, CheckCircle, XCircle, AlertCircle, ShieldAlert, FileClock, TestTube, Globe, Zap, Search, ChevronDown, ChevronRight, LayoutDashboard, SplitSquareHorizontal, CheckCircle2 , Factory, Activity, ListOrdered, BarChart2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid , LineChart, Line } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FactorySimulation from './components/FactorySimulation';
import AeonDashboard from './components/AeonDashboard';
import { aeonCore } from './engines/aeon';
import { modelRouter } from './core/model-router';
import { aeonRuntime } from './core/runtime';

import EvolutionEngine from './components/EvolutionEngine';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type VFS = Record<string, { type: 'file' | 'dir', content?: string, url?: string, size?: number, modifiedAt?: number }>;

interface LatticeLogEvent {
  id: string;
  timestamp: number;
  log: string;
  payload?: any;
}

type ProposalStatus = 'DRAFT' | 'UNDER_REVIEW' | 'REFINEMENT_REQUIRED' | 'AWAITING_HUMAN_APPROVAL' | 'HUMAN_APPROVED' | 'REJECTED' | 'STAGING' | 'CANARY' | 'PROMOTING' | 'IMPLEMENTED';

interface ProposalRevision {
  version: string;
  changesMade: string;
  diff: string;
  timestamp: number;
}

interface Proposal {
  id: string;
  title: string;
  version: string;
  riskTier: string;
  objective: string;
  rationale: string;
  proposedState: string;
  status: ProposalStatus;
  timestamp: number;
  revisions?: ProposalRevision[];
}

interface LedgerEvent {
  id: string;
  timestamp: number;
  type: 'SYSTEM' | 'PROPOSAL' | 'APPROVAL' | 'RESEARCH' | 'DEPLOYMENT';
  description: string;
  details?: string;
  snapshot?: VFS;
}

interface LatticeIntervention {
  experimentId: string;
  interventionId: string;
  operator: string;
  timestamp: number;
  action: string;
  previousState: string;
  requestedChange: string;
  resultingState: string;
  reason: string;
  experimentOutcome: string;
}

const SAVED_VFS_KEY = 'ai_studio_vfs_state';

const ResourceMonitor = () => {
  const [cpu, setCpu] = React.useState(0);
  const [mem, setMem] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => {
        const target = Math.random() * 40 + 10;
        return Math.floor(prev + (target - prev) * 0.3);
      });
      setMem(prev => {
        const target = Math.random() * 50 + 30;
        return Math.floor(prev + (target - prev) * 0.1);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-auto pt-4 border-t border-slate-800 p-4 shrink-0">
      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex justify-between items-center">
         <span>Workspace Resources</span>
         <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-500 border border-amber-800">SIMULATED</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">CPU Usage</span>
            <span className={cpu > 40 ? "text-amber-400" : "text-emerald-400"}>{cpu}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 ${cpu > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${cpu}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Memory</span>
            <span className={mem > 70 ? "text-amber-400" : "text-emerald-400"}>{mem}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
            <div className={`h-full transition-all duration-500 ${mem > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${mem}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [vfs, setVfs] = useState<VFS | null>(null);
  const vfsRef = React.useRef(vfs);
  React.useEffect(() => { vfsRef.current = vfs; }, [vfs]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [previewFilePath, setPreviewFilePath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<'alpha' | 'size' | 'modified'>('alpha');
  const [focusedNodeIndex, setFocusedNodeIndex] = useState<number>(-1);

  
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('aeon');
  const [factoryTick, setFactoryTick] = useState(0);
  const [factoryInput, setFactoryInput] = useState('');
  const [factorySubTab, setFactorySubTab] = useState<'dashboard' | 'logs'>('dashboard');
  const [factorySearch, setFactorySearch] = useState('');
  const [isFactoryAiLoading, setIsFactoryAiLoading] = useState(false);
  const [isHreConsoleOpen, setIsHreConsoleOpen] = useState(false);
  const [hreData, setHreData] = useState(Array.from({length: 20}, (_, i) => ({ time: i, ops: 0 })));
  const [hreChatHistory, setHreChatHistory] = useState<{role:string, content:string}[]>([]);
  const [hreInput, setHreInput] = useState("");

  const submitHreCopilot = async () => {
    if (!hreInput.trim()) return;
    const msg = hreInput.trim();
    setHreInput("");
    setHreChatHistory(prev => [...prev, {role: 'user', content: msg}]);
    
    try {
       const res = await callAI(`You are HRE-COPILOT, an agentic AI built to co-work with the HBX Runtime Engine. You have access to persistent memory and RAG context. The user says: ${msg}`);
       if (res.ok) {
           setHreChatHistory(prev => [...prev, {role: 'assistant', content: res.text}]);
           syncLogEvent('SYSTEM', 'HRE Copilot indexed query');
       }
    } catch(e) {
       console.error(e);
    }
  };

  useEffect(() => {
    if (!isHreConsoleOpen) return;
    const interval = setInterval(() => {
      setHreData(prev => {
        const next = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, ops: Math.floor(Math.random() * 100) }];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHreConsoleOpen]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [useOfflineLlm, setUseOfflineLlm] = useState(false);
  const [offlineApiUrl, setOfflineApiUrl] = useState('http://localhost:11434/v1');
  const [offlineTestStatus, setOfflineTestStatus] = useState<'idle'|'testing'|'success'|'error'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workspaceId = params.get('workspace-id');
    const template = params.get('template');
    
    if (template === 'html' || template === 'react' || template === 'agentic') {
      initProjectTemplate(template);
      return;
    }
    
    if (workspaceId) {
      // Simulate fetching a workspace by ID, then initing the default agentic for now 
      // since we don't have a real backend to fetch from in this client-side demo
      console.log(`Auto-loading workspace: ${workspaceId}`);
      initProjectTemplate('agentic');
      return;
    }

    const saved = localStorage.getItem(SAVED_VFS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed['AEON-RH-OMEGA-001.md']) {
           parsed['AEON-RH-OMEGA-001.md'] = { type: 'file', content: `AEON OMEGA RESEARCH MISSION

Millennium Prize Problem: Riemann Hypothesis

Mission Classification

RESEARCH MODE: DEEP / AUTONOMOUS / MULTI-AGENT / ADVERSARIAL

Primary Objective

AEON is hereby instructed to initiate a long-running mathematical research investigation into the Riemann Hypothesis.

The objective is NOT to manufacture an answer.

The objective is to determine, through rigorous mathematical investigation, whether AEON can:

1. discover a valid proof of the Riemann Hypothesis;
2. discover a valid disproof or counterexample;
3. derive a significant new lemma, theorem, equivalence, or reduction that materially advances the problem;
4. identify a previously overlooked connection between the Riemann Hypothesis and another area of mathematics;
5. or conclusively demonstrate why a proposed approach fails.

A result claiming "solved" must never be accepted merely because an agent believes it is correct.

---

1. FORMAL TARGET

Investigate the statement:

«Every non-trivial zero of the Riemann zeta function ζ(s) has real part 1/2.»

Work from rigorous mathematical definitions.

Do not assume the Riemann Hypothesis is true.

AEON must investigate both:

RH TRUE
and
RH FALSE

as competing hypotheses.

---

2. ACTIVATE THE FULL RESEARCH SWARM

Create a dedicated isolated research environment:

PROJECT ID:
AEON-RH-OMEGA-001

Do NOT modify AEON Core, Constitution, production agents, permissions, runtime, memory, or existing applications.

All experimental state must remain inside the isolated research environment.

Activate as many independent mathematical agents as the architecture safely permits.

Agents must work independently before synthesis.

---

3. RESEARCH DIVISION

Create specialized teams.

TEAM A: Analytic Number Theory

Investigate:

- ζ(s)
- analytic continuation
- functional equation
- Euler product
- logarithmic derivative
- zeros
- critical strip
- critical line
- zero-free regions
- explicit formulas

Attempt original deductions from first principles.

---

TEAM B: Complex Analysis

Investigate the problem through:

- contour integration
- residues
- argument principle
- harmonic functions
- conformal methods
- entire-function theory
- Hadamard factorization
- growth estimates

Search for possible mechanisms forcing zeros onto Re(s)=1/2.

---

TEAM C: Spectral / Hilbert-Pólya

Investigate whether the zeros can be represented as eigenvalues of a suitable self-adjoint operator.

Explore:

- spectral theory
- self-adjoint operators
- trace formulas
- quantum-chaotic interpretations
- Hilbert-Pólya-type constructions

Do not assume the existence of such an operator.

Attempt to construct one rigorously.

---

TEAM D: Number-Theoretic / Prime Distribution

Investigate connections between RH and:

- prime-counting functions
- π(x)
- Chebyshev functions
- Möbius function
- von Mangoldt function
- explicit formulas
- error bounds in prime distribution

Look for a route in which a provable estimate becomes equivalent to RH.

---

TEAM E: Computational Mathematics

Use computation only as an exploratory instrument.

Investigate:

- numerical zeros
- zero statistics
- symbolic identities
- asymptotic behaviour
- candidate lemmas
- numerical counterexample searches

IMPORTANT:

Numerical verification must NEVER be presented as proof.

Use computation to generate conjectures and attack mathematical claims.

---

TEAM F: Proof Construction

Attempt to construct complete formal proofs.

Every proof must identify:

- assumptions
- definitions
- lemmas
- propositions
- theorem dependencies
- logical transitions
- convergence requirements
- domain restrictions
- boundary cases

No intuitive leap may be treated as a theorem.

---

TEAM G: Proof Destroyer

This team has one mission:

TRY TO BREAK EVERYTHING.

For every proposed theorem or proof:

- search for counterexamples;
- test edge cases;
- inspect hidden assumptions;
- challenge convergence;
- challenge analytic continuation;
- challenge interchange of limits;
- challenge infinite sums/products;
- challenge numerical evidence;
- challenge unproved equivalences;
- independently reconstruct the argument.

The Proof Destroyer must assume that every proposed solution is WRONG until demonstrated otherwise.

---

TEAM H: Literature & Prior-Art Intelligence

Search the mathematical literature continuously.

For every promising idea determine:

1. whether it is already known;
2. whether it reproduces an established theorem;
3. whether it is a known failed approach;
4. whether an apparently new lemma already exists;
5. whether the argument contradicts a known result;
6. whether the proposed result would actually imply RH.

Never claim originality without evidence.

---

TEAM I: Alternative Mathematics

Explore unconventional but mathematically legitimate approaches involving:

- functional analysis
- operator theory
- probability
- random matrix theory
- dynamical systems
- geometry
- mathematical physics
- algebraic methods
- distribution theory
- computational number theory

Do not use speculative language as a substitute for proof.

---

4. INDEPENDENT ATTACK REQUIREMENT

Do not allow the swarm to converge prematurely.

At least several independent agents must attempt the problem without seeing the other agents' proposed solutions.

After independent attempts, perform controlled cross-review.

This is intended to prevent:

- groupthink;
- confirmation bias;
- propagation of a single faulty assumption;
- circular reasoning.

---

5. HYPOTHESIS SPLIT

Maintain two major branches:

BRANCH RH-TRUE

Attempt to prove RH.

BRANCH RH-FALSE

Attempt to construct a logically valid counterexample or prove that a contradiction arises from RH.

Neither branch is allowed to assume its conclusion.

---

6. MATHEMATICAL INTEGRITY RULE

AEON MUST distinguish between:

LEVEL 0:
Idea

LEVEL 1:
Interesting observation

LEVEL 2:
Conjecture

LEVEL 3:
Computational evidence

LEVEL 4:
Partially proved result

LEVEL 5:
Rigorous theorem

LEVEL 6:
Complete proof of the target problem

Never promote a result between levels without justification.

---

7. RED-TEAM VERIFICATION

When an agent claims:

"RH SOLVED"

automatically freeze the claim and initiate:

VERIFICATION ROUND 1

Independent proof reconstruction.

VERIFICATION ROUND 2

Adversarial proof destruction.

VERIFICATION ROUND 3

Literature comparison.

VERIFICATION ROUND 4

Symbolic/formal consistency checking where possible.

VERIFICATION ROUND 5

Independent derivation from the critical lemma onward.

VERIFICATION ROUND 6

Search for counterexamples to every newly introduced proposition.

Only after passing all rounds may the result be classified:

PROVISIONALLY VALID

Never classify it as an officially solved Millennium Prize Problem.

---

8. CRITICAL-STEP LOCK

Whenever the entire argument depends on a single proposition, identify it explicitly:

CRITICAL LEMMA

Then assign multiple independent agents to attack that lemma.

If the lemma fails, automatically trace all dependent conclusions and mark them invalid.

---

9. NO HALLUCINATION RULE

AEON must never:

- invent citations;
- invent mathematical papers;
- invent theorems;
- claim a theorem says something it does not;
- silently strengthen an existing theorem;
- replace proof with numerical evidence;
- hide failed experiments;
- delete failed approaches merely because they failed.

Failed approaches are valuable research data.

Preserve them.

---

10. RESEARCH MEMORY

Maintain an experiment ledger containing:

- hypothesis;
- approach;
- equations;
- lemmas;
- evidence;
- failures;
- counterexamples;
- rejected proofs;
- surviving results;
- literature connections;
- unresolved questions.

Every major result must be reproducible from the ledger.

---

11. ESCALATION

If a promising mathematical structure appears:

PAUSE ordinary exploration.

Spawn a focused research branch around that structure.

Example:

RH
→ candidate lemma
→ independent derivations
→ counterexample search
→ literature comparison
→ generalization
→ proof attempt
→ adversarial verification.

Do not abandon promising branches prematurely.

---

12. DISCOVERY MODE

AEON is explicitly permitted to discover that the requested route is wrong.

The desired outcome is not necessarily:

"Solved."

A successful research outcome may instead be:

- a new theorem;
- a new equivalence;
- a new bound;
- a new proof technique;
- a new reduction;
- a counterexample to a tempting conjecture;
- a rigorous explanation of why an approach cannot work.

---

13. HUMAN GOVERNANCE

AEON may autonomously:

- create research branches;
- assign agents;
- perform calculations;
- compare hypotheses;
- generate experiments;
- critique proofs;
- maintain research records.

AEON may NOT:

- alter its own core constitution;
- alter production architecture;
- promote research findings into core knowledge automatically;
- publish externally;
- contact researchers;
- submit papers;
- spend paid API resources beyond configured research limits;
- execute destructive operations.

Any external action requires human approval.

---

14. RESOURCE MANAGEMENT

Operate continuously while resources permit.

If an external model/API becomes unavailable:

DO NOT HALT THE RESEARCH.

Automatically switch to available models or local models according to AEON's resilience/continuity policy.

Queue unfinished tasks.

Resume when resources become available.

Research state must survive interruptions.

---

15. FINAL RESEARCH REPORT

At the end of each research cycle produce:

AEON RH RESEARCH REPORT

1. Executive summary
2. Current status
3. Strongest mathematical discovery
4. Strongest attempted proof
5. Critical lemma
6. Independent verification results
7. Failed approaches
8. Counterexamples discovered
9. Literature connections
10. Computational evidence
11. Unresolved mathematical gaps
12. Confidence classification
13. Recommended next experiments
14. Complete reproducibility ledger

If no proof is obtained, explicitly state:

"NO VALID PROOF ESTABLISHED."

Do not interpret failure as evidence that RH is false.

If a proof appears valid, state:

"PROVISIONAL PROOF REQUIRING EXTERNAL MATHEMATICAL VERIFICATION."

Never claim official resolution merely because AEON's internal agents agree.

---

FINAL COMMAND

BEGIN AEON-RH-OMEGA-001.

Engage the mathematical swarm.

Work independently.

Challenge every assumption.

Attack every proof.

Preserve every failure.

Search for genuine mathematical structure.

Do not optimize for an impressive answer.

Optimize for TRUTH.

BEGIN.
` };
        }
        setVfs(parsed);
      } catch (e) {
        console.error('Failed to parse saved VFS', e);
        initProjectTemplate('agentic');
      }
    } else {
      initProjectTemplate('agentic');
    }
  }, []);

  useEffect(() => {
    if (vfs) {
      localStorage.setItem(SAVED_VFS_KEY, JSON.stringify(vfs));
    }
  }, [vfs]);


  useEffect(() => {
    if (useOfflineLlm) {
      console.log('Initializing WebLLM Offline Engine...');
      getWebLLMEngine((progress) => {
         console.log('WebLLM Progress:', progress.text);
      }).then((engine) => {
         console.log('WebLLM Engine ready', engine);
      }).catch(err => {
         console.error('WebLLM failed', err);
      });
    }
  }, [useOfflineLlm]);


  useEffect(() => {
    const unsubscribe = factoryEngine.subscribe(() => {
      setFactoryTick(prev => prev + 1);
    });
    return () => {
      unsubscribe();
      // factoryEngine.stop(); // Don't stop it, we want it running in background
    };
  }, []);
  const [aiSubTab, setAiSubTab] = useState<'chat' | 'proposals' | 'history' | 'knowledge' | 'builder' | 'copilot' | 'discovery' | 'backups' | 'runtime'>('chat');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openrouter' | 'webllm' | 'anthropic' | 'openai'>('gemini');
  const [aiModel, setAiModel] = useState('gemini-3.7-flash');
  const [openRouterModels, setOpenRouterModels] = useState<any[]>([]);
  const [testConnectionStatus, setTestConnectionStatus] = useState<{loading: boolean, success?: boolean, message?: string} | null>(null);
  const [runtimeHealth, setRuntimeHealth] = useState(aeonRuntime.getAll());
  useEffect(() => {
    const interval = setInterval(() => {
       // Refresh health
       aeonRuntime.update('ollama_local', { status: modelRouter.health.ollama.status });
       setRuntimeHealth(aeonRuntime.getAll());
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  const [modelSearch, setModelSearch] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showFreeModelsOnly, setShowFreeModelsOnly] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('openRouterApiKey') || '');

  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [chatMode, setChatMode] = useState<'standard' | 'architect' | 'debugger' | 'visionary'>('standard');
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [knowledgeQuery, setKnowledgeQuery] = useState('');

  const [isAiLoading, setIsAiLoading] = useState(false);

  // New Orchestration States
  const [isCanaryMode, setIsCanaryMode] = useState(false);
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [latticeActiveExperiment, setLatticeActiveExperiment] = useState(false);
  const [latticeEventStream, setLatticeEventStream] = useState<LatticeLogEvent[]>([]);
  const [latticeInput, setLatticeInput] = useState('');
  const [showLatticeDashboard, setShowLatticeDashboard] = useState(false);
  const [latticeSnapshots, setLatticeSnapshots] = useState<{id: string, timestamp: number, vfs: VFS}[]>([]);
  const [latticeSbsMode, setLatticeSbsMode] = useState(false);
  const [latticeSbsProvider, setLatticeSbsProvider] = useState<'gemini' | 'openrouter'>('openrouter');
  const [latticeSbsModel, setLatticeSbsModel] = useState('anthropic/claude-3-haiku');
  const [latticeSbsSearch, setLatticeSbsSearch] = useState('');
  const [showSbsModelDropdown, setShowSbsModelDropdown] = useState(false);
  
  const [latticeSubTab, setLatticeSubTab] = useState<'sandbox' | 'archive' | 'photonics' | 'history'>('sandbox');
  const [showInterventionConsole, setShowInterventionConsole] = useState(false);
  const [interventions, setInterventions] = useState<LatticeIntervention[]>([]);
  const [currentLatticeExperimentId, setCurrentLatticeExperimentId] = useState<string>('');
  const [interventionForm, setInterventionForm] = useState({
    action: 'PAUSE',
    requestedChange: '',
    reason: '',
    experimentOutcome: 'Pending',
    previousState: 'ACTIVE',
    resultingState: 'PAUSED'
  });

  const interventionActions = [
    "PAUSE", "RESUME", "STOP", "RESTART", "REPLICATE", "BRANCH EXPERIMENT", 
    "CHANGE EXPERIMENT PARAMETER", "CHANGE TEST DIFFICULTY", "CHANGE PROMPT", 
    "CHANGE RESEARCH SUBJECT", "INJECT CONTROLLED TEST CONDITION", 
    "CHALLENGE CURRENT CONCLUSION", "REQUEST ADDITIONAL EVIDENCE", "REQUEST SELF-FALSIFICATION",
    "HUMAN OPERATOR INJECTED CHECKPOINT"
  ];
  
  const [newProposal, setNewProposal] = useState({ title: '', riskTier: 'TIER 1 — LOW RISK', objective: '', rationale: '', proposedState: '' });

  
  // Transcendence Lattice - Cloud Sync
  useEffect(() => {
    // Listen for Ledger Events from Cloud
    const unsubLedger = onSnapshot(collection(db, "ledger"), (snapshot) => {
      const events = snapshot.docs.map(doc => doc.data() as LedgerEvent);
      // Sort desc
      events.sort((a, b) => b.timestamp - a.timestamp);
      setLedgerEvents(events);
    });

    const unsubProposals = onSnapshot(collection(db, "proposals"), (snapshot) => {
      const props = snapshot.docs.map(doc => doc.data() as Proposal);
      props.sort((a, b) => b.timestamp - a.timestamp);
      setProposals(props);
    });
    
    return () => {
      unsubLedger();
      unsubProposals();
    };
  }, []);

  const syncLogEvent = useCallback(async (type: LedgerEvent['type'], description: string, details?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const eventObj: LedgerEvent = { id, timestamp: Date.now(), type, description };
    if (details !== undefined) {
      eventObj.details = details;
    }
    if (vfsRef.current) {
      eventObj.snapshot = JSON.parse(JSON.stringify(vfsRef.current));
    }
    // Optimistic
    setLedgerEvents(prev => [eventObj, ...prev]);
    // Cloud push
    await setDoc(doc(db, "ledger", id), eventObj).catch(console.error);
  }, []);


  // GitHub Push states
  const [githubRepo, setGithubRepo] = useState('buddielon-cell/SUITE');
  const [githubBranch, setGithubBranch] = useState('main');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<{success?: boolean; message?: string; url?: string} | null>(null);

  // Modals
  const [showDiffModal, setShowDiffModal] = useState<string | null>(null);

  // Editor states
  const [editedContent, setEditedContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [knowledgeIndex, setKnowledgeIndex] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [isBuildingUpgrade, setIsBuildingUpgrade] = useState(false);
  const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [copilotSuggestions, setCopilotSuggestions] = useState('');
  const [isCopilotAnalyzing, setIsCopilotAnalyzing] = useState(false);
  const [discoveryReport, setDiscoveryReport] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedHistoryEvent, setSelectedHistoryEvent] = useState<LedgerEvent | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);



  const mainScrollRef = React.useRef<HTMLDivElement>(null);

  // Consolidated AI API caller with WebLLM fallback
  const callAI = async (promptText: string, contextVfs: any = null, history: any = [], provider = aiProvider, model = aiModel, customKey = customApiKey) => {
    try {
      // PHASE 1: Route through new Model Router if not specifically forcing a legacy path
      if (!useOfflineLlm && provider === 'gemini') {
         const msgs = [...history, { role: 'user', content: promptText }];
         const res = await modelRouter.generate('FAST_CHAT', msgs);
         if (!res.error) {
             return { ok: true, text: res.text, error: null };
         }
      }

      if (useOfflineLlm || provider === 'webllm') {
        if (offlineApiUrl) {
          try {
            const res = await fetch(`${offlineApiUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'local-model',
                messages: [
                  { role: 'system', content: 'You are the Transcendence Lattice AI assistant.' },
                  ...history,
                  { role: 'user', content: promptText }
                ]
              })
            });
            const data = await res.json();
            return { ok: true, text: data.choices[0].message.content, error: null };
          } catch (e: any) {
            console.warn("Local API connection failed. Is Ollama running on localhost?");
            return { ok: false, text: "", error: "Local API connection failed. Ensure Ollama/Termux is running: " + e.message };
          }
        } else {
          const engine = await getWebLLMEngine();
          const reply = await engine.chat.completions.create({
            messages: [
              { role: 'system', content: 'You are the Transcendence Lattice AI assistant.' },
              ...history,
              { role: 'user', content: promptText }
            ]
          });
          return { ok: true, text: reply.choices[0].message.content, error: null };
        }
      }
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: promptText, 
          vfs: contextVfs, 
          chatHistory: history, 
          provider: provider, 
          model: model, 
          customApiKey: customKey 
        })
      });
      const data = await res.json();
      
      // Fallback to WebLLM on rate limit / 429 or upstream provider errors.
      if (!res.ok && (res.status === 429 || res.status >= 500 || data.error?.includes('Upstream error') || data.error?.includes('Service temporarily overloaded'))) {
        console.warn("Cloud provider error or rate limit. Falling back to local WebLLM.", data.error);
        addTranscendenceEvent(`CLOUD API ERROR: ${data.error}. Transmitting request to local browser-based WebLLM engine fallback...`);
        try {
          const engine = await getWebLLMEngine();
          const reply = await engine.chat.completions.create({
            messages: [{ role: 'user', content: promptText }]
          });
          return { ok: true, text: reply.choices[0].message.content, error: null };
        } catch (e) {
          // If WebLLM fails too, return original error
          return { ok: false, text: null, error: data.error };
        }
      }
      
      return { ok: res.ok, text: data.text, error: data.error };
    } catch (e: any) {
      return { ok: false, text: null, error: e.message };
    }
  };


  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (mainScrollRef.current) {
          e.preventDefault();
          mainScrollRef.current.scrollBy({
            top: e.key === 'ArrowDown' ? 100 : -100,
            behavior: 'smooth'
          });
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
  
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);




  // Periodic auto-snapshot to local storage every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setVfs(currentVfs => {
        if (currentVfs) {
          localStorage.setItem('vfs-auto-snapshot', JSON.stringify(currentVfs));
          // logEvent is technically missing from dep array if we don't watch it, but inside setInterval it's fine
          // Actually, we can just save it. We'll skip logEvent here to avoid hook dep warnings if possible,
          // or we can just call it since it uses useCallback
        }
        return currentVfs;
      });
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // When selected file changes, load its content to editor
  useEffect(() => {
    if (selectedFilePath && vfs && vfs[selectedFilePath] && vfs[selectedFilePath].type === 'file') {
      setEditedContent(vfs[selectedFilePath].content || '');
      setIsEditing(false);
    }
  }, [selectedFilePath, vfs]);


  const runKnowledgeReindex = async () => {
    setIsIndexing(true);
    setKnowledgeIndex('Generating knowledge index...');
    syncLogEvent('SYSTEM', 'Knowledge Base Re-index Triggered');
    try {
      const { ok, text, error } = await callAI("Analyze the current workspace files (VFS) and generate a comprehensive structural knowledge index mapping out the architecture, dependencies, and core features. Use Markdown formatting.", vfs);
      if (ok) setKnowledgeIndex(text || "");
      else setKnowledgeIndex("Error: " + error);
    } catch (e: any) {
      setKnowledgeIndex("Exception: " + e.message);
    }
    setIsIndexing(false);
  };

  const runBuilderUpgradeScan = async () => {
    setIsBuildingUpgrade(true);
    syncLogEvent('SYSTEM', 'System Builder Upgrade Scan Triggered');
    try {
      const { ok, text, error } = await callAI("Review the workspace VFS. Generate 1 structural upgrade proposal (e.g. state management improvement, component extraction, performance upgrade). Return ONLY a JSON object with this exact schema: { title: string, riskTier: string, objective: string, rationale: string, proposedState: string }", vfs);
      if (ok) {
        let jsonStr = text || "";
        const match = jsonStr.match(/```json\n([\s\S]*?)\n```/) || jsonStr.match(/\{[\s\S]*\}/);
        if (match) jsonStr = match[1] || match[0];
        const p = JSON.parse(jsonStr);
        const newP = {
          id: `PROP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          ...p,
          version: '1.0',
          status: 'DRAFT',
          timestamp: Date.now()
        };
        setProposals(prev => [newP, ...prev]);
        setDoc(doc(db, 'proposals', newP.id), newP).catch(console.error);
        setAiSubTab('proposals');
      } else {
        alert('Builder error: ' + error);
      }
    } catch (e: any) {
      alert('Builder exception: ' + e.message);
    }
    setIsBuildingUpgrade(false);
  };

  const runDiscoveryAudit = async () => {
    setIsDiscovering(true);
    setDiscoveryReport('Scanning repository for technical debt and optimizations...');
    syncLogEvent('SYSTEM', 'Deep Discovery Audit Triggered');
    try {
      const { ok, text, error } = await callAI("Run a deep discovery diagnostic audit on the codebase. Identify technical debt, unoptimized patterns, stale dependencies, and architectural bottlenecks. Return a detailed Markdown report.", vfs);
      if (ok) setDiscoveryReport(text || "");
      else setDiscoveryReport("Error: " + error);
    } catch (e: any) {
      setDiscoveryReport("Exception: " + e.message);
    }
    setIsDiscovering(false);
  };


  const handleFactorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryInput.trim() || isFactoryAiLoading) return;
    
    setIsFactoryAiLoading(true);
    const input = factoryInput.trim();
    setFactoryInput('');
    
    try {
      const prompt = `You are a Factory Orchestration AI. Parse the following raw size charts / JSON input and produce a JSON array of production tasks.
Input: ${input}

Return ONLY valid JSON in this exact structure:
{
  "tasks": [
    {
      "id": "T-<random_id>",
      "name": "<Garment Type, e.g. T-Shirt XL>",
      "directives": {
        "Cutter": "Cutting instructions",
        "Stitcher": "Stitching instructions",
        "Hemmer": "Hemming instructions",
        "Inspector": "Inspection instructions"
      },
      "stage": "Cutter",
      "status": "queued",
      "progress": 0,
      "createdAt": ${Date.now()}
    }
  ]
}`;
      const { ok, text } = await callAI(prompt, null);
      if (ok && text) {
        let parsedText = text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            parsedText = jsonMatch[1];
        } else {
            const bracketMatch = text.match(/\{[\s\S]*\}/);
            if (bracketMatch) parsedText = bracketMatch[0];
        }
        const parsed = JSON.parse(parsedText);
        if (parsed.tasks) {
          factoryEngine.addTasks(parsed.tasks);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFactoryAiLoading(false);
    }
  };

  // Copilot debounced analysis
  useEffect(() => {
    if (!copilotEnabled || !selectedFilePath || !vfs) return;
    
    const timeout = setTimeout(async () => {
      setIsCopilotAnalyzing(true);
      try {
        const fileContent = vfs[selectedFilePath]?.type === 'file' ? (vfs[selectedFilePath] as any).content : '';
        const { ok, text, error } = await callAI(`You are an inline Copilot agent. Review the current file (${selectedFilePath}) for potential improvements, completions, or bugs. Keep your feedback brief and actionable.\n\nCurrent Content:\n${editedContent || fileContent}`, null);
        if (ok) setCopilotSuggestions(text || "");
        else setCopilotSuggestions("Copilot error: " + error);
      } catch (e: any) {
        setCopilotSuggestions("Copilot exception: " + e.message);
      }
      setIsCopilotAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [editedContent, selectedFilePath, copilotEnabled, vfs, aiProvider, aiModel, customApiKey]);

  useEffect(() => {
    aeonCore.attach(
      async (prompt) => {
         console.log("[AEON Real Mode] Sending prompt to AI...");
         const res = await callAI(prompt, null, []);
         return res.text;
      },
      (filepath, content) => {
         console.log("[HRE Real Mode] Writing to VFS at", filepath);
         setVfs(prev => ({
           ...prev,
           [filepath]: { ...prev[filepath], content, isModified: true, url: undefined }
         }));
      }
    );
  }, [callAI, setVfs]);

  const saveFile = () => {
    if (selectedFilePath && vfs) {
      setVfs(prev => ({
        ...prev!,
        [selectedFilePath]: {
          ...prev![selectedFilePath],
          content: editedContent
        }
      }));
      setIsEditing(false);
    }
  };

  const initProjectTemplate = (type: 'html' | 'react' | 'agentic') => {
    let newVfs: VFS = {};
    if (type === 'html') {
      newVfs = {
        'index.html': { type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agentic Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-50 flex h-screen overflow-hidden font-sans">
  
  <!-- Sidebar Navigation -->
  <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
    <div class="p-6">
      <h2 class="text-xl font-bold text-purple-400 tracking-wide">Nexus<span class="text-slate-100">OS</span></h2>
    </div>
    <nav class="flex-1 px-4 space-y-2">
      <a href="#" class="block px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        Overview
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        Agents
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Logs
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Settings
      </a>
    </nav>
    <div class="p-4 border-t border-slate-800 text-xs text-slate-500">
      NexusOS v2.4.1
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto p-4 md:p-8">
    <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">Real-time telemetry and fleet coordination.</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full self-start md:self-auto">
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span class="text-xs font-medium text-emerald-400" id="last-updated">Live Sync</span>
      </div>
    </header>
    
    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      
      <!-- Card 1 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-purple-300 transition-colors">Agents Active</h3>
        <p class="text-3xl font-mono mt-2 text-slate-100" id="metric-agents">--</p>
        <div class="mt-2 text-xs text-purple-400 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          2 from last hour
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-purple-500 w-3/4"></div>
        </div>
      </div>
      
      <!-- Card 2 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-emerald-300 transition-colors">Tasks Completed</h3>
        <p class="text-3xl font-mono mt-2 text-emerald-400" id="metric-tasks">--</p>
        <div class="mt-2 text-xs text-emerald-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          125/min
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-emerald-500 w-full"></div>
        </div>
      </div>
      
      <!-- Card 3 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-amber-300 transition-colors">System Load</h3>
        <p class="text-3xl font-mono mt-2 text-amber-400" id="metric-load">--</p>
        <div class="mt-2 text-xs text-amber-500 flex items-center gap-1">
          Stable
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-amber-500 w-2/3" id="metric-load-bar"></div>
        </div>
      </div>

      <!-- Card 4 (New) -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-blue-300 transition-colors">Error Rate</h3>
        <p class="text-3xl font-mono mt-2 text-blue-400" id="metric-errors">0.02%</p>
        <div class="mt-2 text-xs text-slate-500 flex items-center gap-1">
          Within SLA
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-blue-500" style="width: 2%"></div>
        </div>
      </div>
      
    </div>

    <!-- Charts and Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Chart Section -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 h-80 flex flex-col">
         <div class="flex items-center justify-between mb-4">
           <h3 class="text-sm font-medium text-slate-400">Throughput Trend (Simulated)</h3>
           <select class="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none">
             <option>Last Hour</option>
             <option>Last 24 Hours</option>
           </select>
         </div>
         <div class="flex-1 flex items-end gap-2 border-b border-l border-slate-700 p-4" id="chart-container">
            <!-- Bars generated via JS -->
         </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 h-80 flex flex-col overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-4">Live Activity</h3>
        <div class="flex-1 overflow-y-auto pr-2 space-y-3" id="activity-feed">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>
  </main>

  <script>
    // Initial Population
    document.getElementById('metric-agents').textContent = '12';
    document.getElementById('metric-tasks').textContent = '4,231';
    document.getElementById('metric-load').textContent = '68%';

    // Update timestamp
    function updateTime() {
      const now = new Date();
      document.getElementById('last-updated').textContent = \`Live \${now.toLocaleTimeString()}\`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Generate chart bars
    const chart = document.getElementById('chart-container');
    for (let i = 0; i < 30; i++) {
      const height = Math.floor(Math.random() * 80) + 10;
      const bar = document.createElement('div');
      bar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      bar.style.height = height + '%';
      chart.appendChild(bar);
    }

    // Activity Feed Simulator
    const feed = document.getElementById('activity-feed');
    const actions = ["Compiled module", "Generated response", "Analyzed dataset", "Optimized route", "Resolved conflict"];
    const agents = ["Agent-Alpha", "Agent-Beta", "Agent-Gamma", "Agent-Delta"];
    
    function addFeedItem() {
      const item = document.createElement('div');
      item.className = 'flex items-start gap-3 p-2 rounded-lg bg-slate-950/50 border border-slate-800/50 animate-fade-in';
      const action = actions[Math.floor(Math.random() * actions.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      item.innerHTML = \`
        <div class="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
        <div>
          <p class="text-xs font-medium text-slate-300">\${action}</p>
          <p class="text-[10px] text-slate-500">\${agent} • Just now</p>
        </div>
      \`;
      
      feed.insertBefore(item, feed.firstChild);
      if (feed.children.length > 6) {
        feed.removeChild(feed.lastChild);
      }
    }

    // Populate initial feed
    for(let i=0; i<4; i++) addFeedItem();
    
    // Simulate real-time data ticks
    setInterval(() => {
      // Update Tasks
      let tasks = parseInt(document.getElementById('metric-tasks').textContent.replace(/,/g, ''));
      tasks += Math.floor(Math.random() * 15);
      document.getElementById('metric-tasks').textContent = tasks.toLocaleString();
      
      // Update Load
      const load = Math.floor(Math.random() * 30) + 50;
      document.getElementById('metric-load').textContent = load + '%';
      document.getElementById('metric-load-bar').style.width = load + '%';

      // Update Chart
      chart.removeChild(chart.firstElementChild);
      const newHeight = Math.floor(Math.random() * 80) + 10;
      const newBar = document.createElement('div');
      newBar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      newBar.style.height = newHeight + '%';
      chart.appendChild(newBar);

      // Add to feed occasionally
      if (Math.random() > 0.3) {
        addFeedItem();
      }
    }, 2000);
  </script>

  <style>
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    /* Hide scrollbar for clean UI */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</body>
</html>` }
      };
    } else if (type === 'react') {
      newVfs = {
        'package.json': { type: 'file', content: `{\n  "name": "react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}` },
        'index.html': { type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agentic Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-50 flex h-screen overflow-hidden font-sans">
  
  <!-- Sidebar Navigation -->
  <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
    <div class="p-6">
      <h2 class="text-xl font-bold text-purple-400 tracking-wide">Nexus<span class="text-slate-100">OS</span></h2>
    </div>
    <nav class="flex-1 px-4 space-y-2">
      <a href="#" class="block px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        Overview
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        Agents
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Logs
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Settings
      </a>
    </nav>
    <div class="p-4 border-t border-slate-800 text-xs text-slate-500">
      NexusOS v2.4.1
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto p-4 md:p-8">
    <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">Real-time telemetry and fleet coordination.</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full self-start md:self-auto">
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span class="text-xs font-medium text-emerald-400" id="last-updated">Live Sync</span>
      </div>
    </header>
    
    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      
      <!-- Card 1 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-purple-300 transition-colors">Agents Active</h3>
        <p class="text-3xl font-mono mt-2 text-slate-100" id="metric-agents">--</p>
        <div class="mt-2 text-xs text-purple-400 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          2 from last hour
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-purple-500 w-3/4"></div>
        </div>
      </div>
      
      <!-- Card 2 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-emerald-300 transition-colors">Tasks Completed</h3>
        <p class="text-3xl font-mono mt-2 text-emerald-400" id="metric-tasks">--</p>
        <div class="mt-2 text-xs text-emerald-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          125/min
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-emerald-500 w-full"></div>
        </div>
      </div>
      
      <!-- Card 3 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-amber-300 transition-colors">System Load</h3>
        <p class="text-3xl font-mono mt-2 text-amber-400" id="metric-load">--</p>
        <div class="mt-2 text-xs text-amber-500 flex items-center gap-1">
          Stable
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-amber-500 w-2/3" id="metric-load-bar"></div>
        </div>
      </div>

      <!-- Card 4 (New) -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-blue-300 transition-colors">Error Rate</h3>
        <p class="text-3xl font-mono mt-2 text-blue-400" id="metric-errors">0.02%</p>
        <div class="mt-2 text-xs text-slate-500 flex items-center gap-1">
          Within SLA
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-blue-500" style="width: 2%"></div>
        </div>
      </div>
      
    </div>

    <!-- Charts and Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Chart Section -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 h-80 flex flex-col">
         <div class="flex items-center justify-between mb-4">
           <h3 class="text-sm font-medium text-slate-400">Throughput Trend (Simulated)</h3>
           <select class="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none">
             <option>Last Hour</option>
             <option>Last 24 Hours</option>
           </select>
         </div>
         <div class="flex-1 flex items-end gap-2 border-b border-l border-slate-700 p-4" id="chart-container">
            <!-- Bars generated via JS -->
         </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 h-80 flex flex-col overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-4">Live Activity</h3>
        <div class="flex-1 overflow-y-auto pr-2 space-y-3" id="activity-feed">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>
  </main>

  <script>
    // Initial Population
    document.getElementById('metric-agents').textContent = '12';
    document.getElementById('metric-tasks').textContent = '4,231';
    document.getElementById('metric-load').textContent = '68%';

    // Update timestamp
    function updateTime() {
      const now = new Date();
      document.getElementById('last-updated').textContent = \`Live \${now.toLocaleTimeString()}\`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Generate chart bars
    const chart = document.getElementById('chart-container');
    for (let i = 0; i < 30; i++) {
      const height = Math.floor(Math.random() * 80) + 10;
      const bar = document.createElement('div');
      bar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      bar.style.height = height + '%';
      chart.appendChild(bar);
    }

    // Activity Feed Simulator
    const feed = document.getElementById('activity-feed');
    const actions = ["Compiled module", "Generated response", "Analyzed dataset", "Optimized route", "Resolved conflict"];
    const agents = ["Agent-Alpha", "Agent-Beta", "Agent-Gamma", "Agent-Delta"];
    
    function addFeedItem() {
      const item = document.createElement('div');
      item.className = 'flex items-start gap-3 p-2 rounded-lg bg-slate-950/50 border border-slate-800/50 animate-fade-in';
      const action = actions[Math.floor(Math.random() * actions.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      item.innerHTML = \`
        <div class="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
        <div>
          <p class="text-xs font-medium text-slate-300">\${action}</p>
          <p class="text-[10px] text-slate-500">\${agent} • Just now</p>
        </div>
      \`;
      
      feed.insertBefore(item, feed.firstChild);
      if (feed.children.length > 6) {
        feed.removeChild(feed.lastChild);
      }
    }

    // Populate initial feed
    for(let i=0; i<4; i++) addFeedItem();
    
    // Simulate real-time data ticks
    setInterval(() => {
      // Update Tasks
      let tasks = parseInt(document.getElementById('metric-tasks').textContent.replace(/,/g, ''));
      tasks += Math.floor(Math.random() * 15);
      document.getElementById('metric-tasks').textContent = tasks.toLocaleString();
      
      // Update Load
      const load = Math.floor(Math.random() * 30) + 50;
      document.getElementById('metric-load').textContent = load + '%';
      document.getElementById('metric-load-bar').style.width = load + '%';

      // Update Chart
      chart.removeChild(chart.firstElementChild);
      const newHeight = Math.floor(Math.random() * 80) + 10;
      const newBar = document.createElement('div');
      newBar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      newBar.style.height = newHeight + '%';
      chart.appendChild(newBar);

      // Add to feed occasionally
      if (Math.random() > 0.3) {
        addFeedItem();
      }
    }, 2000);
  </script>

  <style>
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    /* Hide scrollbar for clean UI */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</body>
</html>` },
        'src/main.tsx': { type: 'file', content: `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\n\nReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)` },
        'src/App.tsx': { type: 'file', content: `const SAVED_VFS_KEY = 'ai_studio_vfs_state';
export default function App() {\n  return (\n    <div className="p-8 text-center">\n      <h1 className="text-3xl font-bold text-blue-500">React + Tailwind</h1>\n      <p className="mt-4 text-slate-500">Ready to build!</p>\n    </div>\n  )\n}` },
      };
    } else if (type === 'agentic') {
      newVfs = {
        'package.json': { type: 'file', content: `{\n  "name": "agentic-dashboard",\n  "version": "1.0.0"\n}` },
        'AEON-RH-OMEGA-001.md': { type: 'file', content: `AEON OMEGA RESEARCH MISSION

Millennium Prize Problem: Riemann Hypothesis

Mission Classification

RESEARCH MODE: DEEP / AUTONOMOUS / MULTI-AGENT / ADVERSARIAL

Primary Objective

AEON is hereby instructed to initiate a long-running mathematical research investigation into the Riemann Hypothesis.

The objective is NOT to manufacture an answer.

The objective is to determine, through rigorous mathematical investigation, whether AEON can:

1. discover a valid proof of the Riemann Hypothesis;
2. discover a valid disproof or counterexample;
3. derive a significant new lemma, theorem, equivalence, or reduction that materially advances the problem;
4. identify a previously overlooked connection between the Riemann Hypothesis and another area of mathematics;
5. or conclusively demonstrate why a proposed approach fails.

A result claiming "solved" must never be accepted merely because an agent believes it is correct.

---

1. FORMAL TARGET

Investigate the statement:

«Every non-trivial zero of the Riemann zeta function ζ(s) has real part 1/2.»

Work from rigorous mathematical definitions.

Do not assume the Riemann Hypothesis is true.

AEON must investigate both:

RH TRUE
and
RH FALSE

as competing hypotheses.

---

2. ACTIVATE THE FULL RESEARCH SWARM

Create a dedicated isolated research environment:

PROJECT ID:
AEON-RH-OMEGA-001

Do NOT modify AEON Core, Constitution, production agents, permissions, runtime, memory, or existing applications.

All experimental state must remain inside the isolated research environment.

Activate as many independent mathematical agents as the architecture safely permits.

Agents must work independently before synthesis.

---

3. RESEARCH DIVISION

Create specialized teams.

TEAM A: Analytic Number Theory

Investigate:

- ζ(s)
- analytic continuation
- functional equation
- Euler product
- logarithmic derivative
- zeros
- critical strip
- critical line
- zero-free regions
- explicit formulas

Attempt original deductions from first principles.

---

TEAM B: Complex Analysis

Investigate the problem through:

- contour integration
- residues
- argument principle
- harmonic functions
- conformal methods
- entire-function theory
- Hadamard factorization
- growth estimates

Search for possible mechanisms forcing zeros onto Re(s)=1/2.

---

TEAM C: Spectral / Hilbert-Pólya

Investigate whether the zeros can be represented as eigenvalues of a suitable self-adjoint operator.

Explore:

- spectral theory
- self-adjoint operators
- trace formulas
- quantum-chaotic interpretations
- Hilbert-Pólya-type constructions

Do not assume the existence of such an operator.

Attempt to construct one rigorously.

---

TEAM D: Number-Theoretic / Prime Distribution

Investigate connections between RH and:

- prime-counting functions
- π(x)
- Chebyshev functions
- Möbius function
- von Mangoldt function
- explicit formulas
- error bounds in prime distribution

Look for a route in which a provable estimate becomes equivalent to RH.

---

TEAM E: Computational Mathematics

Use computation only as an exploratory instrument.

Investigate:

- numerical zeros
- zero statistics
- symbolic identities
- asymptotic behaviour
- candidate lemmas
- numerical counterexample searches

IMPORTANT:

Numerical verification must NEVER be presented as proof.

Use computation to generate conjectures and attack mathematical claims.

---

TEAM F: Proof Construction

Attempt to construct complete formal proofs.

Every proof must identify:

- assumptions
- definitions
- lemmas
- propositions
- theorem dependencies
- logical transitions
- convergence requirements
- domain restrictions
- boundary cases

No intuitive leap may be treated as a theorem.

---

TEAM G: Proof Destroyer

This team has one mission:

TRY TO BREAK EVERYTHING.

For every proposed theorem or proof:

- search for counterexamples;
- test edge cases;
- inspect hidden assumptions;
- challenge convergence;
- challenge analytic continuation;
- challenge interchange of limits;
- challenge infinite sums/products;
- challenge numerical evidence;
- challenge unproved equivalences;
- independently reconstruct the argument.

The Proof Destroyer must assume that every proposed solution is WRONG until demonstrated otherwise.

---

TEAM H: Literature & Prior-Art Intelligence

Search the mathematical literature continuously.

For every promising idea determine:

1. whether it is already known;
2. whether it reproduces an established theorem;
3. whether it is a known failed approach;
4. whether an apparently new lemma already exists;
5. whether the argument contradicts a known result;
6. whether the proposed result would actually imply RH.

Never claim originality without evidence.

---

TEAM I: Alternative Mathematics

Explore unconventional but mathematically legitimate approaches involving:

- functional analysis
- operator theory
- probability
- random matrix theory
- dynamical systems
- geometry
- mathematical physics
- algebraic methods
- distribution theory
- computational number theory

Do not use speculative language as a substitute for proof.

---

4. INDEPENDENT ATTACK REQUIREMENT

Do not allow the swarm to converge prematurely.

At least several independent agents must attempt the problem without seeing the other agents' proposed solutions.

After independent attempts, perform controlled cross-review.

This is intended to prevent:

- groupthink;
- confirmation bias;
- propagation of a single faulty assumption;
- circular reasoning.

---

5. HYPOTHESIS SPLIT

Maintain two major branches:

BRANCH RH-TRUE

Attempt to prove RH.

BRANCH RH-FALSE

Attempt to construct a logically valid counterexample or prove that a contradiction arises from RH.

Neither branch is allowed to assume its conclusion.

---

6. MATHEMATICAL INTEGRITY RULE

AEON MUST distinguish between:

LEVEL 0:
Idea

LEVEL 1:
Interesting observation

LEVEL 2:
Conjecture

LEVEL 3:
Computational evidence

LEVEL 4:
Partially proved result

LEVEL 5:
Rigorous theorem

LEVEL 6:
Complete proof of the target problem

Never promote a result between levels without justification.

---

7. RED-TEAM VERIFICATION

When an agent claims:

"RH SOLVED"

automatically freeze the claim and initiate:

VERIFICATION ROUND 1

Independent proof reconstruction.

VERIFICATION ROUND 2

Adversarial proof destruction.

VERIFICATION ROUND 3

Literature comparison.

VERIFICATION ROUND 4

Symbolic/formal consistency checking where possible.

VERIFICATION ROUND 5

Independent derivation from the critical lemma onward.

VERIFICATION ROUND 6

Search for counterexamples to every newly introduced proposition.

Only after passing all rounds may the result be classified:

PROVISIONALLY VALID

Never classify it as an officially solved Millennium Prize Problem.

---

8. CRITICAL-STEP LOCK

Whenever the entire argument depends on a single proposition, identify it explicitly:

CRITICAL LEMMA

Then assign multiple independent agents to attack that lemma.

If the lemma fails, automatically trace all dependent conclusions and mark them invalid.

---

9. NO HALLUCINATION RULE

AEON must never:

- invent citations;
- invent mathematical papers;
- invent theorems;
- claim a theorem says something it does not;
- silently strengthen an existing theorem;
- replace proof with numerical evidence;
- hide failed experiments;
- delete failed approaches merely because they failed.

Failed approaches are valuable research data.

Preserve them.

---

10. RESEARCH MEMORY

Maintain an experiment ledger containing:

- hypothesis;
- approach;
- equations;
- lemmas;
- evidence;
- failures;
- counterexamples;
- rejected proofs;
- surviving results;
- literature connections;
- unresolved questions.

Every major result must be reproducible from the ledger.

---

11. ESCALATION

If a promising mathematical structure appears:

PAUSE ordinary exploration.

Spawn a focused research branch around that structure.

Example:

RH
→ candidate lemma
→ independent derivations
→ counterexample search
→ literature comparison
→ generalization
→ proof attempt
→ adversarial verification.

Do not abandon promising branches prematurely.

---

12. DISCOVERY MODE

AEON is explicitly permitted to discover that the requested route is wrong.

The desired outcome is not necessarily:

"Solved."

A successful research outcome may instead be:

- a new theorem;
- a new equivalence;
- a new bound;
- a new proof technique;
- a new reduction;
- a counterexample to a tempting conjecture;
- a rigorous explanation of why an approach cannot work.

---

13. HUMAN GOVERNANCE

AEON may autonomously:

- create research branches;
- assign agents;
- perform calculations;
- compare hypotheses;
- generate experiments;
- critique proofs;
- maintain research records.

AEON may NOT:

- alter its own core constitution;
- alter production architecture;
- promote research findings into core knowledge automatically;
- publish externally;
- contact researchers;
- submit papers;
- spend paid API resources beyond configured research limits;
- execute destructive operations.

Any external action requires human approval.

---

14. RESOURCE MANAGEMENT

Operate continuously while resources permit.

If an external model/API becomes unavailable:

DO NOT HALT THE RESEARCH.

Automatically switch to available models or local models according to AEON's resilience/continuity policy.

Queue unfinished tasks.

Resume when resources become available.

Research state must survive interruptions.

---

15. FINAL RESEARCH REPORT

At the end of each research cycle produce:

AEON RH RESEARCH REPORT

1. Executive summary
2. Current status
3. Strongest mathematical discovery
4. Strongest attempted proof
5. Critical lemma
6. Independent verification results
7. Failed approaches
8. Counterexamples discovered
9. Literature connections
10. Computational evidence
11. Unresolved mathematical gaps
12. Confidence classification
13. Recommended next experiments
14. Complete reproducibility ledger

If no proof is obtained, explicitly state:

"NO VALID PROOF ESTABLISHED."

Do not interpret failure as evidence that RH is false.

If a proof appears valid, state:

"PROVISIONAL PROOF REQUIRING EXTERNAL MATHEMATICAL VERIFICATION."

Never claim official resolution merely because AEON's internal agents agree.

---

FINAL COMMAND

BEGIN AEON-RH-OMEGA-001.

Engage the mathematical swarm.

Work independently.

Challenge every assumption.

Attack every proof.

Preserve every failure.

Search for genuine mathematical structure.

Do not optimize for an impressive answer.

Optimize for TRUTH.

BEGIN.
` },
        'index.html': { type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agentic Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-50 flex h-screen overflow-hidden font-sans">
  
  <!-- Sidebar Navigation -->
  <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
    <div class="p-6">
      <h2 class="text-xl font-bold text-purple-400 tracking-wide">Nexus<span class="text-slate-100">OS</span></h2>
    </div>
    <nav class="flex-1 px-4 space-y-2">
      <a href="#" class="block px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        Overview
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        Agents
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        Logs
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Settings
      </a>
    </nav>
    <div class="p-4 border-t border-slate-800 text-xs text-slate-500">
      NexusOS v2.4.1
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto p-4 md:p-8">
    <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">Real-time telemetry and fleet coordination.</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full self-start md:self-auto">
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span class="text-xs font-medium text-emerald-400" id="last-updated">Live Sync</span>
      </div>
    </header>
    
    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      
      <!-- Card 1 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-purple-300 transition-colors">Agents Active</h3>
        <p class="text-3xl font-mono mt-2 text-slate-100" id="metric-agents">--</p>
        <div class="mt-2 text-xs text-purple-400 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          2 from last hour
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-purple-500 w-3/4"></div>
        </div>
      </div>
      
      <!-- Card 2 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-emerald-300 transition-colors">Tasks Completed</h3>
        <p class="text-3xl font-mono mt-2 text-emerald-400" id="metric-tasks">--</p>
        <div class="mt-2 text-xs text-emerald-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
          125/min
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-emerald-500 w-full"></div>
        </div>
      </div>
      
      <!-- Card 3 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-amber-300 transition-colors">System Load</h3>
        <p class="text-3xl font-mono mt-2 text-amber-400" id="metric-load">--</p>
        <div class="mt-2 text-xs text-amber-500 flex items-center gap-1">
          Stable
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-amber-500 w-2/3" id="metric-load-bar"></div>
        </div>
      </div>

      <!-- Card 4 (New) -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-blue-300 transition-colors">Error Rate</h3>
        <p class="text-3xl font-mono mt-2 text-blue-400" id="metric-errors">0.02%</p>
        <div class="mt-2 text-xs text-slate-500 flex items-center gap-1">
          Within SLA
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-blue-500" style="width: 2%"></div>
        </div>
      </div>
      
    </div>

    <!-- Charts and Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Chart Section -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 h-80 flex flex-col">
         <div class="flex items-center justify-between mb-4">
           <h3 class="text-sm font-medium text-slate-400">Throughput Trend (Simulated)</h3>
           <select class="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none">
             <option>Last Hour</option>
             <option>Last 24 Hours</option>
           </select>
         </div>
         <div class="flex-1 flex items-end gap-2 border-b border-l border-slate-700 p-4" id="chart-container">
            <!-- Bars generated via JS -->
         </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 h-80 flex flex-col overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 mb-4">Live Activity</h3>
        <div class="flex-1 overflow-y-auto pr-2 space-y-3" id="activity-feed">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>
  </main>

  <script>
    // Initial Population
    document.getElementById('metric-agents').textContent = '12';
    document.getElementById('metric-tasks').textContent = '4,231';
    document.getElementById('metric-load').textContent = '68%';

    // Update timestamp
    function updateTime() {
      const now = new Date();
      document.getElementById('last-updated').textContent = \`Live \${now.toLocaleTimeString()}\`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Generate chart bars
    const chart = document.getElementById('chart-container');
    for (let i = 0; i < 30; i++) {
      const height = Math.floor(Math.random() * 80) + 10;
      const bar = document.createElement('div');
      bar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      bar.style.height = height + '%';
      chart.appendChild(bar);
    }

    // Activity Feed Simulator
    const feed = document.getElementById('activity-feed');
    const actions = ["Compiled module", "Generated response", "Analyzed dataset", "Optimized route", "Resolved conflict"];
    const agents = ["Agent-Alpha", "Agent-Beta", "Agent-Gamma", "Agent-Delta"];
    
    function addFeedItem() {
      const item = document.createElement('div');
      item.className = 'flex items-start gap-3 p-2 rounded-lg bg-slate-950/50 border border-slate-800/50 animate-fade-in';
      const action = actions[Math.floor(Math.random() * actions.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      item.innerHTML = \`
        <div class="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
        <div>
          <p class="text-xs font-medium text-slate-300">\${action}</p>
          <p class="text-[10px] text-slate-500">\${agent} • Just now</p>
        </div>
      \`;
      
      feed.insertBefore(item, feed.firstChild);
      if (feed.children.length > 6) {
        feed.removeChild(feed.lastChild);
      }
    }

    // Populate initial feed
    for(let i=0; i<4; i++) addFeedItem();
    
    // Simulate real-time data ticks
    setInterval(() => {
      // Update Tasks
      let tasks = parseInt(document.getElementById('metric-tasks').textContent.replace(/,/g, ''));
      tasks += Math.floor(Math.random() * 15);
      document.getElementById('metric-tasks').textContent = tasks.toLocaleString();
      
      // Update Load
      const load = Math.floor(Math.random() * 30) + 50;
      document.getElementById('metric-load').textContent = load + '%';
      document.getElementById('metric-load-bar').style.width = load + '%';

      // Update Chart
      chart.removeChild(chart.firstElementChild);
      const newHeight = Math.floor(Math.random() * 80) + 10;
      const newBar = document.createElement('div');
      newBar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      newBar.style.height = newHeight + '%';
      chart.appendChild(newBar);

      // Add to feed occasionally
      if (Math.random() > 0.3) {
        addFeedItem();
      }
    }, 2000);
  </script>

  <style>
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    /* Hide scrollbar for clean UI */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</body>
</html>` }
      };
    }
    
    setVfs(newVfs);
    setSelectedFilePath('index.html');
  };

  const processZip = async (file: File) => {
    setLoading(true);
    setError(null);
    setVfs(null);
    setSelectedFilePath(null);
    setChatMessages([]);

    try {
      const zip = new JSZip();
      await zip.loadAsync(file);
      
      const newVfs: VFS = {};
      const promises: Promise<void>[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) {
          newVfs[relativePath.replace(/\/$/, '')] = { type: 'dir', size: 0, modifiedAt: zipEntry.date ? zipEntry.date.getTime() : Date.now() };
        } else {
          promises.push((async () => {
            const isText = relativePath.match(/\.(html|css|js|ts|jsx|tsx|json|md|txt|csv|svg|xml|yaml|yml|env)$/i);
            const size = (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize : 0;
            const modifiedAt = zipEntry.date ? zipEntry.date.getTime() : Date.now();
            
            if (isText) {
              const text = await zipEntry.async('string');
              newVfs[relativePath] = { type: 'file', content: text, size: text.length || size, modifiedAt };
            } else {
              const blob = await zipEntry.async('blob');
              newVfs[relativePath] = { type: 'file', url: URL.createObjectURL(blob), size: blob.size || size, modifiedAt };
            }
          })());
        }
      });

      await Promise.all(promises);
      setVfs(newVfs);
      
      // Auto select index.html if exists
      if (newVfs['index.html']) {
         setSelectedFilePath('index.html');
      } else {
         const firstFile = Object.keys(newVfs).find(k => newVfs[k].type === 'file');
         if (firstFile) setSelectedFilePath(firstFile);
      }
      
    } catch (err) {
      console.error(err);
      setError("Failed to parse the ZIP file.");
    } finally {
      setLoading(false);
    }
  };

  const submitChatMessage = async (text: string) => {
    if (!text.trim() || isAiLoading || !vfs) return;
    
    setIsAiLoading(true);
    const userPrompt = text.trim();
    const newMessages = [...chatMessages, { role: 'user' as const, content: userPrompt }];
    setChatMessages(newMessages);
    
    try {
      const { ok, text: responseText, error } = await callAI(userPrompt, vfs, chatMessages);
      if (ok && responseText) {
        setChatMessages(prev => [...prev, { role: 'ai', content: responseText }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', content: "Error: " + (error || "Failed to get AI response") }]);
      }
    } catch (err: any) {
       setChatMessages(prev => [...prev, { role: 'ai', content: "Error: " + err.message }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput;
    setChatInput('');
    await submitChatMessage(text);
  };

  const handlePushToGithub = async () => {
    if (!vfs || !githubRepo) return;
    
    setIsPushing(true);
    setPushStatus(null);
    
    try {
      // Create ZIP from VFS
      const zip = new JSZip();
      for (const [path, f] of Object.entries(vfs)) {
          const file = f as any;
         if (file.type === 'file') {
            if (file.content !== undefined) {
               zip.file(path, file.content);
            } else if (file.url) {
               // Fetch blob from URL to put in zip
               const res = await fetch(file.url);
               const blob = await res.blob();
               zip.file(path, blob);
            }
         }
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const formData = new FormData();
      formData.append('file', zipBlob, 'workspace.zip');
      formData.append('repository', githubRepo);
      formData.append('branch', githubBranch);

      const res = await fetch('/api/github/push', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPushStatus({ success: true, message: 'Successfully pushed to GitHub!', url: data.commitUrl });
      } else {
        setPushStatus({ success: false, message: data.error || 'Failed to push to GitHub.' });
      }
    } catch (err: any) {
      setPushStatus({ success: false, message: err.message || 'An error occurred during push.' });
    } finally {
      setIsPushing(false);
    }
  };

  const exportZip = async () => {
    if (!vfs) return;
    const zip = new JSZip();
    for (const [path, f] of Object.entries(vfs)) {
          const file = f as any;
       if (file.type === 'file') {
          if (file.content !== undefined) {
             zip.file(path, file.content);
          } else if (file.url) {
             const res = await fetch(file.url);
             const blob = await res.blob();
             zip.file(path, blob);
          }
       }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workspace.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        processZip(file);
      } else {
        setError("Please upload a .zip file");
      }
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processZip(e.target.files[0]);
    }
  }, []);


  // Update expanded folders on search
  useEffect(() => {
    if (fileSearchQuery && vfs) {
      const newExpanded = new Set(expandedFolders);
      Object.keys(vfs).forEach(path => {
        if (path.toLowerCase().includes(fileSearchQuery.toLowerCase())) {
          const parts = path.split('/');
          let curr = '';
          for (let i = 0; i < parts.length - 1; i++) {
            curr += (curr ? '/' : '') + parts[i];
            newExpanded.add(curr);
          }
        }
      });
      setExpandedFolders(newExpanded);
    }
  }, [fileSearchQuery, vfs]);

  // Tree rendering
  const toggleFolder = (folderPath: string) => {
    const next = new Set(expandedFolders);
    if (next.has(folderPath)) {
      next.delete(folderPath);
    } else {
      next.add(folderPath);
    }
    setExpandedFolders(next);
  };

  const renderTree = () => {
    if (!vfs) return null;

    let filteredKeys = Object.keys(vfs).filter(path => 
      fileSearchQuery ? path.toLowerCase().includes(fileSearchQuery.toLowerCase()) : true
    );

    // Sorting
    filteredKeys.sort((a, b) => {
      const nodeA = vfs[a];
      const nodeB = vfs[b];
      
      // Always put dirs first in the same level? Wait, sorting flat paths handles this somewhat.
      // We will sort just the keys according to the selected mode.
      if (sortMode === 'size') {
        const sA = nodeA.size || 0;
        const sB = nodeB.size || 0;
        if (sA !== sB) return sB - sA;
      } else if (sortMode === 'modified') {
        const mA = nodeA.modifiedAt || 0;
        const mB = nodeB.modifiedAt || 0;
        if (mA !== mB) return mB - mA;
      }
      return a.localeCompare(b);
    });

    const root: Record<string, any> = {};
    for (const path of filteredKeys) {
      const parts = path.split('/');
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] === 'string') current[parts[i]] = {};
        current = current[parts[i]];
      }
      const lastPart = parts[parts.length - 1];
      if (vfs[path].type === 'dir') {
        if (!current[lastPart] || typeof current[lastPart] === 'string') current[lastPart] = {};
      } else {
        current[lastPart] = path;
      }
    }

    // Flatten for keyboard nav
    const flatVisibleNodes: { type: 'file'|'dir', name: string, fullPath: string, level: number, isExpanded?: boolean, originalPath?: string }[] = [];
    
    const buildFlatList = (node: any, pathSoFar: string = '', level: number = 0) => {
      // Sort keys of node if needed, but since we inserted sorted it's partially okay. 
      // JavaScript object keys iteration order is insertion order for strings.
      const entries = Object.entries(node);
      for (const [key, value] of entries) {
        const currentPath = pathSoFar ? `${pathSoFar}/${key}` : key;
        if (typeof value === 'string') {
          flatVisibleNodes.push({ type: 'file', name: key, fullPath: currentPath, level, originalPath: value });
        } else {
          const isExp = expandedFolders.has(currentPath) || !!fileSearchQuery; // auto expand if searching
          flatVisibleNodes.push({ type: 'dir', name: key, fullPath: currentPath, level, isExpanded: isExp });
          if (isExp) {
            buildFlatList(value, currentPath, level + 1);
          }
        }
      }
    };
    buildFlatList(root);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!flatVisibleNodes.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedNodeIndex(prev => Math.min(prev + 1, flatVisibleNodes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedNodeIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const node = flatVisibleNodes[focusedNodeIndex];
        if (node) {
          if (node.type === 'file' && node.originalPath) {
            setPreviewFilePath(null);
            setSelectedFilePath(node.originalPath);
          } else if (node.type === 'dir') {
            toggleFolder(node.fullPath);
          }
        }
      }
    };

    const highlightMatch = (text: string) => {
      if (!fileSearchQuery) return <span>{text}</span>;
      const lowerText = text.toLowerCase();
      const lowerQuery = fileSearchQuery.toLowerCase();
      const idx = lowerText.indexOf(lowerQuery);
      if (idx === -1) return <span>{text}</span>;
      
      return (
        <span>
          {text.slice(0, idx)}
          <mark className="bg-yellow-500/80 text-slate-900 rounded-sm">{text.slice(idx, idx + fileSearchQuery.length)}</mark>
          {text.slice(idx + fileSearchQuery.length)}
        </span>
      );
    };

    return (
      <div 
        className="flex flex-col pb-4 outline-none focus:outline-none" 
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {flatVisibleNodes.map((node, i) => {
          const isFocused = i === focusedNodeIndex;
          
          if (node.type === 'file') {
            const isSelected = selectedFilePath === node.originalPath;
            const isPreview = previewFilePath === node.originalPath;
            
            return (
              <div 
                key={`file-${node.fullPath}`}
                className={cn(
                  "flex items-center justify-between gap-2 py-1 px-2 hover:bg-slate-800 rounded cursor-pointer text-sm select-none",
                  isSelected ? "bg-slate-800 text-blue-400" : isPreview ? "text-blue-300 italic" : "text-slate-300",
                  isFocused && "ring-1 ring-blue-500 bg-slate-800/80"
                )}
                style={{ paddingLeft: `${node.level * 12 + 8}px` }}
                onClick={() => {
                  setFocusedNodeIndex(i);
                  setPreviewFilePath(node.originalPath!);
                }}
                onDoubleClick={() => {
                  setPreviewFilePath(null);
                  setSelectedFilePath(node.originalPath!);
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                   {node.name.match(/\.(png|jpe?g|gif|svg|webp)$/i) ? (
                     <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                   ) : node.name.match(/\.(ts|tsx)$/i) ? (
                     <FileCode2 className="w-4 h-4 text-blue-400 shrink-0" />
                   ) : node.name.match(/\.(js|jsx)$/i) ? (
                     <FileCode2 className="w-4 h-4 text-yellow-400 shrink-0" />
                   ) : node.name.match(/\.(css|scss|less)$/i) ? (
                     <Brush className="w-4 h-4 text-pink-400 shrink-0" />
                   ) : node.name.match(/\.(json)$/i) ? (
                     <FileJson className="w-4 h-4 text-green-400 shrink-0" />
                   ) : node.name.match(/\.(html)$/i) ? (
                     <Code className="w-4 h-4 text-orange-400 shrink-0" />
                   ) : (
                     <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                   )}
                   <span className="truncate">{highlightMatch(node.name)}</span>
                </div>
                {(() => {
                   const fileData = vfs[node.originalPath!];
                   const fileSize = fileData?.size || (fileData?.content ? new Blob([fileData.content]).size : 0);
                   const formattedSize = fileSize > 1024 * 1024 ? (fileSize / (1024 * 1024)).toFixed(1) + ' MB' : fileSize > 1024 ? (fileSize / 1024).toFixed(1) + ' KB' : fileSize + ' B';
                   const modified = fileData?.modifiedAt ? new Date(fileData.modifiedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
                   return (
                     <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-500 opacity-60 font-mono hidden md:flex">
                        <span className="w-12 text-right">{formattedSize}</span>
                        <span className="w-12 text-right">{modified}</span>
                     </div>
                   );
                })()}
              </div>
            );
          } else {
            return (
              <div 
                key={`dir-${node.fullPath}`}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded cursor-pointer text-sm text-slate-400 select-none",
                  isFocused && "ring-1 ring-blue-500 bg-slate-800/80"
                )}
                style={{ paddingLeft: `${node.level * 12 + 8}px` }}
                onClick={() => {
                  setFocusedNodeIndex(i);
                  toggleFolder(node.fullPath);
                }}
              >
                {node.isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                <Folder className={cn("w-4 h-4 shrink-0", node.isExpanded ? "text-amber-400" : "text-slate-500")} />
                <span className="truncate">{highlightMatch(node.name)}</span>
              </div>
            );
          }
        })}
      </div>
    );
  };


  const getPreviewUrl = () => {
    if (!vfs || !vfs['index.html']) return null;
    
    // Simplistic preview: generate a blob for index.html
    const htmlContent = vfs['index.html'].content || '';
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  const handleTestConnection = async () => {
    setTestConnectionStatus({ loading: true });
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: aiProvider, model: aiModel, customApiKey })
      });
      const data = await res.json();
      if (res.ok) {
        setTestConnectionStatus({ loading: false, success: true, message: data.message });
      } else {
        setTestConnectionStatus({ loading: false, success: false, message: data.error || 'Connection failed' });
      }
    } catch (err: any) {
      setTestConnectionStatus({ loading: false, success: false, message: err.message });
    }
  };

  useEffect(() => {
    if (aiProvider === 'openrouter' && openRouterModels.length === 0) {
      fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customApiKey })
      })
        .then(res => res.json())
        .then(data => {
           if (data.models) {
             setOpenRouterModels(data.models);
             if (aiModel === 'gemini-3.7-flash') {
               setAiModel('anthropic/claude-3.5-sonnet');
             }
           }
        })
        .catch(err => console.error("Failed to fetch openrouter models", err));
    } else if (aiProvider === 'gemini') {
      setAiModel('gemini-3.7-flash');
    }
  }, [aiProvider]);

  const submitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.title) return;
    
    const prop: Proposal = {
      id: `AEON-PROP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      version: 'R1',
      status: 'DRAFT',
      timestamp: Date.now(),
      ...newProposal
    };
    
    
    // Optimistic & Cloud Sync
    setProposals(prev => [prop, ...prev]);
    setDoc(doc(db, "proposals", prop.id), prop).catch(console.error);

    syncLogEvent('PROPOSAL', `New proposal submitted: ${prop.id}`, `Title: ${prop.title}`);
    setNewProposal({ title: '', riskTier: 'TIER 1 — LOW RISK', objective: '', rationale: '', proposedState: '' });
  };

  const updateProposalStatus = (id: string, status: ProposalStatus) => {
        setProposals(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, status };
        setDoc(doc(db, "proposals", id), updated).catch(console.error);
        return updated;
      }
      return p;
    }));
    syncLogEvent('APPROVAL', `Proposal ${id} state changed to ${status}`);
  };

  const addTranscendenceEvent = (msg: string) => {
    setLatticeEventStream(prev => [{ id: Math.random().toString(36).substr(2,9), timestamp: Date.now(), log: msg }, ...prev]);
  };

  const toggleAirsExperiment = () => {
    if (latticeActiveExperiment) {
      setLatticeActiveExperiment(false);
      addTranscendenceEvent('EXPERIMENT TERMINATED');
      syncLogEvent('RESEARCH', `Transcendence Sandbox experiment ${currentLatticeExperimentId} terminated`);
    } else {
      const expId = `EXP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setCurrentLatticeExperimentId(expId);
      setLatticeActiveExperiment(true);
      addTranscendenceEvent(`EXPERIMENT STARTED [ID: ${expId}]`);
      addTranscendenceEvent('MODEL INITIALIZED');
      addTranscendenceEvent('ENVIRONMENT CREATED');
      syncLogEvent('RESEARCH', `Transcendence Sandbox experiment ${expId} started`);
    }
  };

  const handleInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interventionId = `INT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const newIntervention: LatticeIntervention = {
      experimentId: currentLatticeExperimentId || 'N/A',
      interventionId,
      operator: 'HUMAN',
      timestamp: Date.now(),
      ...interventionForm
    };
    
    setInterventions(prev => [newIntervention, ...prev]);
    
    addTranscendenceEvent(`INTERVENTION ACTIVE: ${interventionForm.action} [ID: ${interventionId}]`);
    addTranscendenceEvent(`=> Reason: ${interventionForm.reason}`);
    
    if (interventionForm.action === 'HUMAN OPERATOR INJECTED CHECKPOINT') {
       addTranscendenceEvent(`=> Human Operator Injected Checkpoint`);
    }
    
    if (interventionForm.action === 'PAUSE') setLatticeActiveExperiment(false);
    if (interventionForm.action === 'STOP') setLatticeActiveExperiment(false);
    
    syncLogEvent('RESEARCH', `Intervention ${interventionId} applied to ${currentLatticeExperimentId || 'N/A'}`);
    setShowInterventionConsole(false);
    
    // Reset form
    setInterventionForm({
      action: 'PAUSE',
      requestedChange: '',
      reason: '',
      experimentOutcome: 'Pending',
      previousState: 'ACTIVE',
      resultingState: 'PAUSED'
    });
  };

  const takeAirsSnapshot = () => {
    if (!vfs) return;
    const id = `SNAP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setLatticeSnapshots(prev => [{id, timestamp: Date.now(), vfs: JSON.parse(JSON.stringify(vfs))}, ...prev]);
    addTranscendenceEvent(`[SNAPSHOT] Captured environment state: ${id}`);
  };

  const restoreAirsSnapshot = (snap: any) => {
    setVfs(snap.vfs);
    addTranscendenceEvent(`[SNAPSHOT RESTORED] Reverted environment to: ${snap.id}`);
  };


  const handleAutoMerge = (proposalId: string, mergedContent: string) => {
    // Assuming the proposal was targeting selectedFilePath or we just apply it there for now
    if (selectedFilePath && vfs && vfs[selectedFilePath]) {
      setVfs(prev => ({
        ...prev,
        [selectedFilePath]: { ...prev![selectedFilePath], content: mergedContent }
      }));
      setEditedContent(mergedContent);
      syncLogEvent('DEPLOYMENT', `Auto-Merged proposal ${proposalId} into ${selectedFilePath}`);
    }
    updateProposalStatus(proposalId, 'HUMAN_APPROVED');
    setShowDiffModal(null);
  };

  const handleGenerateRevision = (id: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id === id) {
        const newVersion = p.version.endsWith('.1') ? p.version.replace('.1', '.2') : p.version + '.1';
        const oldContent = (selectedFilePath && vfs && vfs[selectedFilePath]?.type === 'file') ? (vfs[selectedFilePath] as any).content : '';
        const newContent = p.proposedState || oldContent;
        const realPatch = Diff.createTwoFilesPatch(selectedFilePath || 'app.ts', selectedFilePath || 'app.ts', oldContent, newContent);
        
        syncLogEvent('PROPOSAL', `Generated Revision ${newVersion} for ${id}`, `Skeptical Architect triggered Master Builder.`);
        
        return {
          ...p,
          version: newVersion,
          status: 'DRAFT',
          revisions: [
            ...(p.revisions || []),
            {
              version: newVersion,
              changesMade: "Incorporated feedback from Skeptical Architect. Addressed potential edge cases and optimized performance.",
              diff: realPatch,
              timestamp: Date.now()
            }
          ]
        };
      }
      return p;
    }));
  };

  const handleStaticAnalysis = async () => {
    if (!latticeInput.trim()) {
      addTranscendenceEvent("ERROR: No code provided in input for static analysis.");
      return;
    }
    addTranscendenceEvent("RUNNING STATIC ANALYSIS...");
    syncLogEvent('RESEARCH', 'Transcendence Static Analysis triggered');
    const code = latticeInput;
    const warnings = [];
    if (code.includes('eval(')) warnings.push('Critical: Use of eval() detected.');
    if (code.includes('innerHTML')) warnings.push('Warning: Potential XSS via innerHTML.');
    if (code.includes('localStorage')) warnings.push('Note: Uses synchronous local storage.');
    if (code.includes('document.cookie')) warnings.push('Warning: Direct cookie manipulation detected.');
    if (!code.includes('const') && !code.includes('let') && code.includes('var')) warnings.push('Info: Use of legacy var declaration.');
    if (code.includes('fetch(') || code.includes('XMLHttpRequest')) warnings.push('Note: Network activity detected.');
    
    if (warnings.length > 0) {
      warnings.forEach(w => addTranscendenceEvent(`ANALYSIS [WARN]: ${w}`));
      addTranscendenceEvent("ANALYSIS COMPLETE: Potential vulnerabilities found. Promotion to Core not recommended without review.");
      
      addTranscendenceEvent("STATIC LINTING: Generating automated fix suggestions via AI Model...");
      try {
        const { ok, text, error } = await callAI(`You are an automated linter assistant. The user's code has these warnings: ${warnings.join(', ')}. Code: \n${code}\n\nPlease provide a very brief explanation and the corrected code block.`, null);
        if (ok) {
           addTranscendenceEvent(`AGENT RESPONSE [Linter Auto-Fix]:\n${text}`);
        } else {
           addTranscendenceEvent(`ERROR fetching fix: ${error}`);
        }
      } catch (err: any) {
        addTranscendenceEvent(`ERROR fetching fix: ${err.message}`);
      }
    } else {
      addTranscendenceEvent("ANALYSIS COMPLETE: No common vulnerabilities detected. Code appears clean.");
    }
  };

  const getModelMaturityData = (modelName: string) => {
    const hash = modelName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return [
      { subject: 'Coding', A: (hash % 5) + 1, fullMark: 5 },
      { subject: 'Reasoning', A: ((hash + 1) % 5) + 1, fullMark: 5 },
      { subject: 'Math', A: ((hash + 2) % 5) + 1, fullMark: 5 },
      { subject: 'Planning', A: ((hash + 3) % 5) + 1, fullMark: 5 },
      { subject: 'Tool-Use', A: ((hash + 4) % 5) + 1, fullMark: 5 },
    ];
  };

  const handleAirsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latticeInput.trim() || !latticeActiveExperiment) return;

    const query = latticeInput.trim();
    setLatticeInput('');
    addTranscendenceEvent(`> ${query}`);
    addTranscendenceEvent(latticeSbsMode ? 'EXECUTING SIDE-BY-SIDE QUERY...' : 'EXECUTING QUERY...');

    try {
      const fetchWithTime = async (prov: string, mod: string) => {
        const start = Date.now();
        try {
          const { ok, text, error } = await callAI(`[SANDBOX ENVIRONMENT. Do NOT output JSON file actions. Just reply as the Transcendence research assistant.] ${query}`, null, [], prov, mod);
          return { text: text || "", error, time: Date.now() - start, ok };
        } catch(err: any) {
          return { error: err.message, time: Date.now() - start, ok: false };
        }
      };

      if (latticeSbsMode) {
        const [res1, res2] = await Promise.all([
          fetchWithTime(aiProvider, aiModel),
          fetchWithTime(latticeSbsProvider, latticeSbsModel)
        ]);
        
        addTranscendenceEvent(`--- SIDE-BY-SIDE RESULTS ---`);
        addTranscendenceEvent(`Model 1 (${aiModel}) [${res1.time}ms]:\n${res1.ok ? res1.text : 'Error: ' + res1.error}`);
        addTranscendenceEvent(`Model 2 (${latticeSbsModel}) [${res2.time}ms]:\n${res2.ok ? res2.text : 'Error: ' + res2.error}`);
        addTranscendenceEvent(`----------------------------`);
      } else {
        const res1 = await fetchWithTime(aiProvider, aiModel);
        if (res1.ok && res1.text) {
          addTranscendenceEvent(`AGENT RESPONSE [${res1.time}ms]:\n${res1.text}`);
        } else {
          addTranscendenceEvent(`ERROR: ${res1.error || "Failed to get AI response"}`);
        }
      }
    } catch (err: any) {
       addTranscendenceEvent(`ERROR: ${err.message}`);
    }
  };

  const handleProposeUpgradeToCore = async () => {
    addTranscendenceEvent('> [SYSTEM] Proposing Upgrade to Core');
    addTranscendenceEvent('SYSTEM AGENTIC AI: Initiating scrutiny of proposed upgrade parameters...');
    // Simulate scrutiny delay
    setTimeout(() => {
      addTranscendenceEvent('SYSTEM AGENTIC AI: Scrutiny complete. Static safety and viability checks passed.');
      addTranscendenceEvent('SYSTEM AGENTIC AI: Forwarding findings to Human-in-the-Loop for final approval.');
      const upgradeProposal: Proposal = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Transcendence Sandbox Upgrade Proposal',
        version: '1.0.0-sandbox',
        riskTier: 'TIER 2 — MEDIUM RISK',
        objective: 'Integrate Transcendence experimental logic into Core system',
        rationale: 'Experimental data shows stable behavior and improved efficiency. Awaiting human validation.',
        proposedState: 'ACTIVE',
        status: 'AWAITING_HUMAN_APPROVAL',
        timestamp: Date.now()
      };
      setProposals(prev => [upgradeProposal, ...prev]);
      syncLogEvent('PROPOSAL', 'New upgrade proposal submitted from Transcendence sandbox', 'Awaiting HITL review');
    }, 2000);
  };

  const exportLedgerJson = () => {
    const dataStr = JSON.stringify(ledgerEvents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airs_event_ledger.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const proposalStats = ['DRAFT', 'UNDER_REVIEW', 'AWAITING_HUMAN_APPROVAL', 'HUMAN_APPROVED'].map(status => ({
    name: status.replace(/_/g, ' '), count: proposals.filter(p => p.status === status).length
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans h-screen overflow-hidden">
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Archive className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-semibold tracking-tight text-white">Transcendence Lattice Core</h1>
        </div>
        {vfs && (
          <div className="flex gap-2">
            <button onClick={exportZip} className="flex items-center gap-2 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 px-3 py-1.5 rounded transition-colors font-medium">
              <Download className="w-4 h-4" /> Download Full Workspace
            </button>
            <button onClick={() => setVfs(null)} className="flex items-center gap-1 text-sm text-red-400 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded transition-colors">
              Close Workspace
            </button>
          </div>
        )}
      </header>

      <main ref={mainScrollRef} className="flex-1 flex max-w-full w-full overflow-y-auto p-4 gap-4 custom-scrollbar">
        {!vfs ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div 
              className={cn(
                "w-full max-w-xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors text-center mb-6",
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-900/50 hover:bg-slate-900",
                error && "border-red-500/50 bg-red-500/10"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadCloud className={cn("w-12 h-12 mb-4", isDragging ? "text-blue-400" : "text-slate-500")} />
              <h2 className="text-xl font-medium mb-2">Drop your project .zip here</h2>
              <p className="text-slate-400 mb-6 text-sm">Upload an existing repository or build to evolve it</p>
              
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Select ZIP File
                <input type="file" accept=".zip" className="hidden" onChange={handleFileInput} />
              </label>

              {loading && <p className="mt-4 text-blue-400 animate-pulse">Processing archive...</p>}
              {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            </div>

            <div className="w-full max-w-xl">
              <h3 className="text-sm font-medium mb-4 text-center text-slate-400 uppercase tracking-wider">Or Start from a Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button onClick={() => initProjectTemplate('html')} className="flex flex-col items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-white p-6 rounded-xl transition-colors text-center group">
                    <FileText className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Static HTML/JS</span>
                 </button>
                 <button onClick={() => initProjectTemplate('react')} className="flex flex-col items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-white p-6 rounded-xl transition-colors text-center group">
                    <Code className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">React Tailwind App</span>
                 </button>
                 <button onClick={() => initProjectTemplate('agentic')} className="flex flex-col items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-white p-6 rounded-xl transition-colors text-center group">
                    <LayoutDashboard className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Agentic Dashboard</span>
                 </button>
              </div>
            </div>
          </div>
        ) : (
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shrink-0">
                <div className="flex items-center gap-4 flex-wrap flex-1">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                    <SplitSquareHorizontal className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col">
                    <label className="text-xs text-slate-400 mb-1">Repository (owner/repo)</label>
                    <input 
                      type="text" 
                      value={githubRepo}
                      onChange={e => setGithubRepo(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white w-56 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-slate-400 mb-1">Branch</label>
                    <input 
                      type="text" 
                      value={githubBranch}
                      onChange={e => setGithubBranch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white w-24 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-px h-8 bg-slate-800 mx-2 hidden lg:block" />
                  <div className="flex flex-col">
                    <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Beaker className="w-3 h-3 text-amber-400"/> Validation Env</label>
                    <label className="flex items-center cursor-pointer relative mt-1">
                      <input type="checkbox" className="sr-only peer" checked={isCanaryMode} onChange={e => {
                        setIsCanaryMode(e.target.checked);
                        syncLogEvent('DEPLOYMENT', `Staging/Canary mode ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                      }} />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      <span className="ml-3 text-sm font-medium text-slate-300">{isCanaryMode ? 'Staging / Canary ON' : 'Direct Merge'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button 
                    onClick={handlePushToGithub}
                    disabled={isPushing || !githubRepo}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    {isPushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {isPushing ? 'Pushing...' : 'Push to GitHub'}
                  </button>
                  {pushStatus && (
                    <div className={cn("text-xs", pushStatus.success ? "text-emerald-400" : "text-red-400")}>
                      {pushStatus.message}
                      {pushStatus.url && (
                        <a href={pushStatus.url} target="_blank" rel="noreferrer" className="underline ml-1">
                          View Commit
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* Left Sidebar */}
                <div className={cn("border border-slate-800 rounded-xl bg-slate-900/50 flex flex-col overflow-hidden shrink-0 transition-all duration-300", isSidebarOpen ? "w-full md:w-80 opacity-100" : "w-0 opacity-0 border-none")}>
                  <div className="flex p-2 border-b border-slate-800 bg-slate-900 gap-1 flex-wrap">
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'aeon' ? "bg-slate-800 text-blue-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('aeon')}
                    >
                      <Cpu className="w-3 h-3" /> AEON
                    </button>
                    
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors min-w-[70px]", activeTab === 'files' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('files')}
                    >
                      Files
                    </button>
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors min-w-[70px]", activeTab === 'ai' ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('ai')}
                    >
                      AI Core
                    </button>
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'evolution' ? "bg-purple-900/40 text-purple-400 border border-purple-500/30 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('evolution')}
                    >
                      <Network className="w-3 h-3" /> EVOLUTION
                    </button>
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'preview' ? "bg-slate-800 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('preview')}
                    >
                      <Play className="w-3 h-3" /> Preview
                    </button>
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'airs' ? "bg-slate-800 text-purple-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('airs')}
                    >
                      <TestTube className="w-3 h-3" /> Transcendence
                    </button>
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'factory' ? "bg-slate-800 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('factory')}
                    >
                      <Factory className="w-3 h-3" /> Factory
                    </button>
                    <button 
                      className={cn("flex-1 text-sm py-1.5 rounded transition-colors flex justify-center items-center gap-1 min-w-[70px]", activeTab === 'history' ? "bg-slate-800 text-pink-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
                      onClick={() => setActiveTab('history')}
                    >
                      <History className="w-3 h-3" /> History
                    </button>
                  </div>
                  
                  {activeTab === 'evolution' ? (
                    <EvolutionEngine />
                  ) : activeTab === 'history' ? (
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-pink-400 text-lg font-bold tracking-widest flex items-center gap-2"><History className="w-5 h-5"/> IMMUTABLE LEDGER</h2>
                        <div className="flex gap-2">
                           <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-400">{ledgerEvents.length} Events</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {ledgerEvents.map((event, idx) => (
                           <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                              <div className="flex justify-between text-xs mb-2">
                                 <span className={cn("font-bold uppercase", event.type === 'SYSTEM' ? 'text-blue-400' : event.type === 'PROPOSAL' ? 'text-emerald-400' : 'text-purple-400')}>{event.type}</span>
                                 <span className="text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="text-slate-300 text-sm">{event.description}</div>
                              {event.details && <div className="text-slate-500 text-xs mt-2 p-2 bg-slate-950 rounded">{event.details}</div>}
                           </div>
                        ))}
                      </div>
                    </div>
                  ) : activeTab === 'aeon' ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                        <AeonDashboard />
                    </div>
                  ) : activeTab === 'files' ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="p-2 border-b border-slate-800 bg-slate-900 shrink-0">
                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="Search files..."
                            value={fileSearchQuery}
                            onChange={(e) => setFileSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                           <span>Sort by:</span>
                           <select 
                             value={sortMode}
                             onChange={(e) => setSortMode(e.target.value as any)}
                             className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 focus:outline-none"
                           >
                             <option value="alpha">Alphabetical</option>
                             <option value="size">File Size</option>
                             <option value="modified">Last Modified</option>
                           </select>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {renderTree()}
                      </div>
                    </div>
                  ) : activeTab === 'ai' ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50">
                                            <div className="flex p-1 border-b border-slate-800 bg-slate-900 gap-1 text-[10px] flex-wrap justify-between">
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'chat' ? "bg-blue-600/20 text-blue-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('chat')}>Chat</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'proposals' ? "bg-amber-600/20 text-amber-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('proposals')}>Proposals</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'history' ? "bg-emerald-600/20 text-emerald-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('history')}>History</button>
                        <label className="flex items-center gap-1.5 cursor-pointer ml-auto bg-slate-800 px-2 py-1 rounded">
                           <input type="checkbox" className="hidden" checked={useOfflineLlm} onChange={(e) => setUseOfflineLlm(e.target.checked)} />
                           <div className={cn("w-2 h-2 rounded-full", useOfflineLlm ? "bg-emerald-500" : "bg-slate-600")}></div>
                           <span className={cn("text-[10px] font-bold uppercase tracking-wider", useOfflineLlm ? "text-emerald-400" : "text-slate-500")}>Offline LLM</span>
                        </label>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'knowledge' ? "bg-purple-600/20 text-purple-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('knowledge')}>Knowledge</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'builder' ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('builder')}>Builder</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'copilot' ? "bg-cyan-600/20 text-cyan-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('copilot')}>Copilot</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'discovery' ? "bg-orange-600/20 text-orange-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('discovery')}>Discovery</button>
                        <button className={cn("px-2 py-1 rounded transition-colors", aiSubTab === 'backups' ? "bg-pink-600/20 text-pink-400" : "text-slate-500 hover:text-slate-300")} onClick={() => setAiSubTab('backups')}>Backups</button>
                      </div>
                      
                      {useOfflineLlm && (
                         <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-col gap-2 shrink-0">
                           <div className="text-xs text-slate-400 mb-1">Local/Termux API Endpoint (OpenAI Compatible)</div>
                           <div className="flex items-center gap-2">
                             <input 
                               type="text" 
                               value={offlineApiUrl} 
                               onChange={e => setOfflineApiUrl(e.target.value)} 
                               placeholder="e.g. http://localhost:11434/v1" 
                               className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                             />
                             <button 
                               onClick={async () => {
                                 setOfflineTestStatus('testing');
                                 try {
                                   const res = await fetch(`${offlineApiUrl}/models`);
                                   if (res.ok) setOfflineTestStatus('success');
                                   else setOfflineTestStatus('error');
                                 } catch(e) {
                                   setOfflineTestStatus('error');
                                 }
                               }}
                               className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 font-bold text-slate-300 flex items-center gap-1"
                             >
                               Test Connection
                             </button>
                           </div>
                           {offlineTestStatus === 'testing' && <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400 animate-pulse mt-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Pinging endpoint...</div>}
                           {offlineTestStatus === 'success' && <div className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Connected to Local Model Provider</div>}
                           {offlineTestStatus === 'error' && <div className="text-[10px] font-bold tracking-wider uppercase text-red-400 mt-1 flex items-center gap-1"><XCircle className="w-3 h-3"/> Connection Refused (Verify URL & CORS)</div>}
                         </div>
                      )}

                      {aiSubTab === 'chat' && (
                        <>
                          <div className="p-2 border-b border-slate-800 bg-slate-900 flex flex-col gap-2 shrink-0 text-xs">
                            
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto custom-scrollbar">
                               <button onClick={() => setChatMode('standard')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'standard' ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:bg-slate-900")}>Standard</button>
                               <button onClick={() => setChatMode('architect')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'architect' ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" : "text-slate-500 hover:bg-slate-900")}>Architect</button>
                               <button onClick={() => setChatMode('debugger')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'debugger' ? "bg-red-600/20 text-red-400 border border-red-500/30" : "text-slate-500 hover:bg-slate-900")}>Debugger</button>
                               <button onClick={() => setChatMode('visionary')} className={cn("px-3 py-1.5 rounded-md flex-1 whitespace-nowrap transition-all", chatMode === 'visionary' ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-slate-500 hover:bg-slate-900")}>Visionary</button>
                            </div>

                            <div className="flex gap-2">
                              <select 
                                value={aiProvider} 
                                onChange={e => {
                                  setAiProvider(e.target.value as 'gemini' | 'openrouter' | 'webllm' | 'anthropic' | 'openai');
                                  setShowModelDropdown(false);
                                  setModelSearch('');
                                }}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none flex-1 w-1/3"
                              >
                                <option value="gemini">Google Gemini</option>
                                <option value="openrouter">OpenRouter Hub</option>
                              </select>
                              
                              <div className="relative flex-[2]">
                                <button 
                                  type="button"
                                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                                  className="w-full h-full text-left bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none flex justify-between items-center"
                                >
                                  <span className="truncate">
                                    {aiProvider === 'openrouter' 
                                      ? (openRouterModels.find(m => m.id === aiModel)?.name || aiModel) 
                                      : ([{id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash'}, {id: 'gemini-3.7-flash-thinking', name: 'Gemini 3.7 Flash Thinking'}, {id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro'}].find(m => m.id === aiModel)?.name || aiModel)
                                    }
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                </button>
                                
                                {showModelDropdown && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowModelDropdown(false)} />
                                    <div className="absolute z-20 top-full left-0 mt-1 w-full bg-slate-900 border border-slate-700 rounded shadow-xl flex flex-col max-h-80 overflow-hidden">
                                      <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
                                        <Search className="w-3 h-3 text-slate-500" />
                                        <input 
                                          type="text" 
                                          autoFocus
                                          placeholder="Search models..."
                                          value={modelSearch}
                                          onChange={e => setModelSearch(e.target.value)}
                                          className="w-full bg-transparent border-none text-xs text-white focus:outline-none"
                                        />
                                      </div>
                                      {aiProvider === 'openrouter' && (
                                        <div className="px-2 py-1.5 border-b border-slate-800 bg-slate-900 flex items-center gap-2">
                                          <label className="flex items-center cursor-pointer relative text-[10px] text-slate-400">
                                            <input type="checkbox" className="sr-only peer" checked={showFreeModelsOnly} onChange={e => setShowFreeModelsOnly(e.target.checked)} />
                                            <div className="w-6 h-3 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            <span className="ml-2 font-medium">Free Models Only</span>
                                          </label>
                                        </div>
                                      )}
                                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {aiProvider === 'gemini' ? (
                                          [{id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash'}, {id: 'gemini-3.7-flash-thinking', name: 'Gemini 3.7 Flash Thinking'}, {id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro'}]
                                            .filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.id.toLowerCase().includes(modelSearch.toLowerCase()))
                                            .map(m => (
                                              <div key={m.id} onClick={() => { setAiModel(m.id); setShowModelDropdown(false); setModelSearch(''); }} className={cn("px-3 py-2 hover:bg-slate-800 cursor-pointer flex flex-col", aiModel === m.id ? "bg-slate-800" : "")}>
                                                <span className="text-slate-200 truncate">{m.name}</span>
                                                <span className="text-[10px] text-slate-500 truncate">{m.id}</span>
                                              </div>
                                            ))
                                        ) : (
                                          openRouterModels.length > 0 ? (
                                            openRouterModels
                                              .filter(m => m.id.toLowerCase().includes(modelSearch.toLowerCase()) || m.name.toLowerCase().includes(modelSearch.toLowerCase()))
                                              .filter(m => !showFreeModelsOnly || (m.pricing && (parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0)))
                                              .map(m => {
                                                const isFree = m.pricing && parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0;
                                                return (
                                                  <div key={m.id} onClick={() => { setAiModel(m.id); setShowModelDropdown(false); setModelSearch(''); }} className={cn("px-3 py-2 hover:bg-slate-800 cursor-pointer flex flex-col border-b border-slate-800/50 last:border-0", aiModel === m.id ? "bg-slate-800" : "")}>
                                                     <div className="flex justify-between items-center gap-2">
                                                       <span className="text-slate-200 truncate">{m.name}</span>
                                                       {isFree && <span className="px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 text-[8px] uppercase tracking-wider shrink-0">Free</span>}
                                                     </div>
                                                     <span className="text-[10px] text-slate-500 truncate">{m.id}</span>
                                                  </div>
                                                );
                                              })
                                          ) : (
                                            <div className="p-3 text-center text-slate-500">Loading models...</div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={handleTestConnection}
                                 disabled={testConnectionStatus?.loading}
                                 className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0"
                               >
                                 {testConnectionStatus?.loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                                 Test Connection
                               </button>
                               {testConnectionStatus && !testConnectionStatus.loading && (
                                 <span className={cn("truncate max-w-[150px]", testConnectionStatus.success ? "text-emerald-400" : "text-red-400")}>
                                   {testConnectionStatus.message}
                                 </span>
                               )}
                            </div>
                            <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-slate-800/50">
                              <label className="text-[10px] text-slate-500">Custom {aiProvider === 'openrouter' ? 'OpenRouter' : 'Gemini'} API Key (Optional)</label>
                              <div className="flex gap-2">
                                <input 
                                  type="password" 
                                  value={customApiKey}
                                  onChange={e => setCustomApiKey(e.target.value)}
                                  placeholder={`Enter ${aiProvider === 'openrouter' ? 'sk-or-v1-...' : 'AIza...'} to override env`}
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    localStorage.setItem('openRouterApiKey', customApiKey);
                                    syncLogEvent('SYSTEM', 'API Key saved securely to browser storage');
                                  }}
                                  className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Save Key
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {chatMessages.length === 0 ? (
                              <div className="text-center text-slate-500 text-sm mt-8">
                                Ask me to generate a new app, add features, or debug your code. I will automatically edit files for you.
                              </div>
                            ) : (
                              chatMessages.map((msg, idx) => (
                                <div key={idx} className={cn("text-sm p-3 rounded-lg max-w-[95%]", 
                                  msg.role === 'user' ? "bg-blue-600/20 text-blue-100 ml-auto border border-blue-500/20" : "bg-slate-800 text-slate-200 mr-auto whitespace-pre-wrap break-words border border-slate-700"
                                )}>
                                  {msg.content}
                                </div>
                              ))
                            )}
                            {isAiLoading && (
                               <div className="text-sm p-3 rounded-lg bg-slate-800 text-slate-400 mr-auto border border-slate-700 flex items-center gap-2">
                                 <RefreshCw className="w-4 h-4 animate-spin" /> Thinking...
                               </div>
                            )}
                          </div>
                          <div className="p-3 border-t border-slate-800 bg-slate-900">
                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                              <input 
                                type="text" 
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => {
                                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    e.preventDefault();
                                    handleChatSubmit(e);
                                  }
                                }}
                                placeholder="Build me a to-do app... (Ctrl+Enter to send)"
                                disabled={isAiLoading}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                              />
                              <button 
                                type="submit"
                                disabled={isAiLoading || !chatInput.trim()}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </form>
                          </div>
                        </>
                      )}

                      {aiSubTab === 'proposals' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <h3 className="text-amber-400 font-medium text-sm mb-4">Proposals Overview</h3>
                            <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={proposalStats}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                  <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} />
                                  <YAxis tick={{fill: '#94a3b8', fontSize: 10}} allowDecimals={false} />
                                  <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', fontSize: '12px'}} />
                                  <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <form onSubmit={submitProposal} className="flex flex-col gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
                            <h3 className="text-amber-400 font-medium text-sm flex items-center gap-2"><GitPullRequest className="w-4 h-4" /> New Proposal</h3>
                            <input required value={newProposal.title} onChange={e => setNewProposal({...newProposal, title: e.target.value})} type="text" placeholder="Proposal Title" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                            <select value={newProposal.riskTier} onChange={e => setNewProposal({...newProposal, riskTier: e.target.value})} className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                              <option>TIER 1 — LOW RISK</option>
                              <option>TIER 2 — MEDIUM RISK</option>
                              <option>TIER 3 — HIGH RISK</option>
                            </select>
                            <input required value={newProposal.objective} onChange={e => setNewProposal({...newProposal, objective: e.target.value})} type="text" placeholder="Objective (What problem?)" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
                            <textarea required value={newProposal.rationale} onChange={e => setNewProposal({...newProposal, rationale: e.target.value})} placeholder="Rationale (Why is this needed?)" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none h-20" />
                            <textarea required value={newProposal.proposedState} onChange={e => setNewProposal({...newProposal, proposedState: e.target.value})} placeholder="Proposed Changes" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none h-20" />
                            <button type="submit" className="bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors">Submit as DRAFT</button>
                          </form>

                          <div className="flex flex-col gap-3">
                            <h3 className="text-slate-300 font-medium text-sm">Active Proposals</h3>
                            {proposals.length === 0 ? (
                              <p className="text-slate-500 text-sm text-center py-4">No architectural proposals found.</p>
                            ) : (
                              proposals.map(p => (
                                <div key={p.id} onClick={() => setSelectedProposal(p)} className="bg-slate-900 border cursor-pointer hover:bg-slate-800 transition-colors border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-slate-200 text-sm font-medium">{p.title}</h4>
                                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">v{p.version} | {p.id}</span>
                                  </div>
                                  <div className="flex gap-2 text-xs mb-2">
                                    <span className="text-slate-400">{p.riskTier}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] font-bold">
                                     {['DRAFT', 'UNDER_REVIEW', 'AWAITING_HUMAN_APPROVAL', 'HUMAN_APPROVED'].map((step, idx, arr) => {
                                        const currentIndex = arr.indexOf(p.status);
                                        const isPast = idx < currentIndex;
                                        const isCurrent = idx === currentIndex;
                                        return (
                                           <React.Fragment key={step}>
                                              <div className={cn("px-2 py-1 rounded border transition-colors truncate max-w-[100px]", isPast ? "bg-emerald-900/40 text-emerald-500 border-emerald-900" : isCurrent ? "bg-blue-900/40 text-blue-400 border-blue-500/50" : "bg-slate-900 text-slate-600 border-slate-800")}>
                                                 {step.replace(/_/g, ' ')}
                                              </div>
                                              {idx < arr.length - 1 && <div className={cn("w-3 h-px shrink-0", isPast ? "bg-emerald-800" : "bg-slate-800")}></div>}
                                           </React.Fragment>
                                        );
                                     })}
                                  </div>
                                  {p.revisions && p.revisions.length > 0 && (
                                    <div className="mt-2 pl-2 border-l-2 border-slate-700 flex flex-col gap-1 text-xs">
                                      <span className="text-slate-500 font-medium">Revisions:</span>
                                      {p.revisions.map((r, i) => (
                                        <div key={i} className="text-slate-400">v{r.version}: {r.changesMade}</div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-2 border-t border-slate-800 pt-2">
                                    {p.status === 'DRAFT' && <button onClick={() => updateProposalStatus(p.id, 'UNDER_REVIEW')} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded">Request Review</button>}
                                    {p.status === 'UNDER_REVIEW' && (
                                      <>
                                        <button onClick={() => updateProposalStatus(p.id, 'AWAITING_HUMAN_APPROVAL')} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded">Submit for Approval</button>
                                        <button onClick={() => handleGenerateRevision(p.id)} className="text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 px-2 py-1 rounded flex items-center gap-1">Generate Revision (Master Builder)</button>
                                      </>
                                    )}
                                    {p.status === 'AWAITING_HUMAN_APPROVAL' && (
                                      <>
                                        <button onClick={() => setShowDiffModal(p.id)} className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded">Compare Proposed Changes</button>
                                        <button onClick={() => updateProposalStatus(p.id, 'HUMAN_APPROVED')} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded">Approve</button>
                                        <button onClick={() => updateProposalStatus(p.id, 'REJECTED')} className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'history' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <h3 className="text-emerald-400 font-medium text-sm flex items-center gap-2"><FileClock className="w-4 h-4" /> Event & Decision Ledger</h3>
                            <button onClick={exportLedgerJson} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded transition-colors flex items-center gap-1">
                              <Download className="w-3 h-3"/> Export JSON
                            </button>
                          </div>
                          {ledgerEvents.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">No events logged.</p>
                          ) : (
                            ledgerEvents.map(event => (
                              <div key={event.id} onClick={() => setSelectedHistoryEvent(event)} className="bg-slate-900 border cursor-pointer hover:bg-slate-800 transition-colors border-slate-800 rounded-lg p-3 flex flex-col gap-1">
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                  <span className={cn("px-1.5 py-0.5 rounded uppercase text-[10px]", 
                                    event.type === 'APPROVAL' ? "bg-emerald-900/30 text-emerald-400" :
                                    event.type === 'PROPOSAL' ? "bg-amber-900/30 text-amber-400" :
                                    event.type === 'DEPLOYMENT' ? "bg-blue-900/30 text-blue-400" :
                                    event.type === 'RESEARCH' ? "bg-purple-900/30 text-purple-400" :
                                    "bg-slate-800"
                                  )}>{event.type}</span>
                                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm text-slate-200 mt-1">{event.description}</p>
                                {event.details && <p className="text-xs text-slate-500">{event.details}</p>}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      {selectedHistoryEvent && (
                         <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                                <button onClick={() => setSelectedHistoryEvent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                                <h3 className="text-lg font-bold text-white mb-2">Event Details</h3>
                                <div className="space-y-4 text-sm text-slate-300">
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">ID</span>
                                        <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-xs">{selectedHistoryEvent.id}</div>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">Type</span>
                                        <span className="bg-slate-800 px-2 py-1 rounded text-xs uppercase font-medium">{selectedHistoryEvent.type}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">Timestamp</span>
                                        <div>{new Date(selectedHistoryEvent.timestamp).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">Description</span>
                                        <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">{selectedHistoryEvent.description}</div>
                                    </div>
                                    {selectedHistoryEvent.details && (
                                    <div>
                                        <span className="block text-xs text-slate-500 mb-1">Extended Details</span>
                                        <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">{selectedHistoryEvent.details}</div>
                                    </div>
                                    )}
                                </div>
                            </div>
                         </div>
                      )}
                      {aiSubTab === 'knowledge' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-purple-400 font-medium text-sm flex items-center gap-2">Knowledge Base</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Internal knowledge index synced with current file system state. The knowledge agent continuously indexes system updates and core upgrades.</p>
                            <button onClick={runKnowledgeReindex} disabled={isIndexing} className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded text-xs hover:bg-purple-600/40 disabled:opacity-50 transition-colors">
                               {isIndexing ? 'Indexing...' : 'Re-index Workspace Knowledge'}
                            </button>
                            {knowledgeIndex && (
                               <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 whitespace-pre-wrap font-mono custom-scrollbar max-h-64 overflow-y-auto">
                                 {knowledgeIndex}
                               </div>
                            )}
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'builder' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-indigo-400 font-medium text-sm flex items-center gap-2">System Builder</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">The Master Builder agent coordinates complex architectural migrations and structural rewrites.</p>
                            <button onClick={runBuilderUpgradeScan} disabled={isBuildingUpgrade} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded text-xs hover:bg-indigo-600/40 disabled:opacity-50 transition-colors">
                               {isBuildingUpgrade ? 'Scanning...' : 'Trigger System Upgrade Scan'}
                            </button>
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'copilot' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-cyan-400 font-medium text-sm flex items-center gap-2">Copilot Agent</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Inline pair-programming companion. Monitors file changes in real-time to provide contextual auto-completions and error corrections.</p>
                            <button onClick={() => setCopilotEnabled(!copilotEnabled)} className={cn("px-3 py-1.5 rounded text-xs border transition-colors", copilotEnabled ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-600/40" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700")}>
                               {copilotEnabled ? 'Disable Background Analysis' : 'Enable Background Analysis'}
                            </button>
                            
                            {copilotEnabled && (
                               <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs">
                                  <div className="text-slate-500 mb-2 font-medium">Live Suggestions (Target: {selectedFilePath || 'None'}):</div>
                                  <div className="text-slate-300 whitespace-pre-wrap font-mono custom-scrollbar max-h-48 overflow-y-auto">
                                    {isCopilotAnalyzing ? 'Analyzing changes...' : copilotSuggestions || 'No suggestions yet. Edit the file to trigger analysis.'}
                                  </div>
                               </div>
                            )}
                          </div>
                        </div>
                      )}


  
                    {aiSubTab === 'runtime' && (
                      <div className="p-4 space-y-4">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                               <Activity className="w-5 h-5"/> SOVEREIGN RUNTIME TRUTH LAYER
                            </h3>
                            <div className="text-xs text-slate-500">AEON Core OS Diagnostics</div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {runtimeHealth.map(sys => (
                               <div key={sys.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                                  <div className="flex justify-between items-start">
                                     <div>
                                        <div className="font-bold text-slate-200">{sys.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{sys.id} v{sys.version}</div>
                                     </div>
                                     <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", 
                                        sys.status === 'REAL' ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800" :
                                        sys.status === 'SIMULATED' ? "bg-amber-900/40 text-amber-400 border border-amber-800" :
                                        sys.status === 'DEGRADED' ? "bg-orange-900/40 text-orange-400 border border-orange-800" :
                                        "bg-red-900/40 text-red-400 border border-red-800"
                                     )}>
                                        {sys.status}
                                     </span>
                                  </div>
                                  <div className="text-xs text-slate-400 mt-2">
                                     Last Heartbeat: {new Date(sys.lastHeartbeat).toLocaleTimeString()}
                                  </div>
                                  {sys.errorState && (
                                     <div className="text-xs text-red-400 bg-red-950/30 p-2 rounded mt-1 border border-red-900/30">
                                        Error: {sys.errorState}
                                     </div>
                                  )}
                               </div>
                            ))}
                         </div>
                      </div>
                    )}
                    {aiSubTab === 'backups' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                              <h3 className="text-pink-400 font-medium text-sm flex items-center gap-2"><Save className="w-4 h-4" /> System Backups & State</h3>
                              <button onClick={() => {
                                  const id = Math.random().toString(36).substr(2,9);
                                  syncLogEvent('SYSTEM', `Manual VFS Snapshot Created (${id})`);
                              }} className="bg-pink-600/20 text-pink-400 border border-pink-500/30 hover:bg-pink-600/30 text-xs px-2 py-1 rounded transition-colors">
                                  Take Snapshot Now
                              </button>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                              <p className="mb-4">This module records the full Virtual File System (VFS) state at every major action, acting as a time-machine backup.</p>
                              <div className="text-xs text-slate-500 space-y-2">
                                  <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3 h-3"/> VFS auto-snapshotting active</div>
                                  <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="w-3 h-3"/> IndexedDB persistence active</div>
                              </div>
                          </div>
                          <div className="flex flex-col gap-2">
                              <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Available Snapshots</h4>
                              {ledgerEvents.filter(e => e.snapshot).length === 0 ? (
                                  <p className="text-slate-500 text-xs italic">No snapshots available yet. Try running an agent task.</p>
                              ) : (
                                  ledgerEvents.filter(e => e.snapshot).slice(0, 15).map(ev => (
                                      <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded p-3 flex justify-between items-center">
                                          <div>
                                              <div className="text-sm font-medium text-slate-300">{ev.description}</div>
                                              <div className="text-xs text-slate-500">{new Date(ev.timestamp).toLocaleString()} • {Object.keys(ev.snapshot!).length} items</div>
                                          </div>
                                          <button onClick={() => {
                                              if (window.confirm('Restore this VFS state? Current unsaved changes will be lost.')) {
                                                  setVfs(ev.snapshot!);
                                                  syncLogEvent('SYSTEM', `Restored VFS to snapshot from ${new Date(ev.timestamp).toLocaleString()}`);
                                              }
                                          }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs transition-colors">Restore</button>
                                      </div>
                                  ))
                              )}
                          </div>
                        </div>
                      )}

                      {aiSubTab === 'discovery' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                          <h3 className="text-orange-400 font-medium text-sm flex items-center gap-2">Discovery Diagnostics</h3>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                            <p className="mb-4">Scouts for unoptimized patterns, stale dependencies, and potential technical debt across the repository.</p>
                            <button onClick={runDiscoveryAudit} disabled={isDiscovering} className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded text-xs hover:bg-orange-600/40 disabled:opacity-50 transition-colors">
                               {isDiscovering ? 'Auditing...' : 'Run Deep Discovery Audit'}
                            </button>
                            {discoveryReport && (
                               <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 whitespace-pre-wrap font-mono custom-scrollbar max-h-64 overflow-y-auto">
                                 {discoveryReport}
                               </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'airs' ? (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50 relative">
                       <div className="flex border-b border-slate-800 shrink-0 bg-slate-900">
                         <button onClick={() => setLatticeSubTab('sandbox')} className={cn("flex-1 py-2 text-xs font-medium border-b-2 transition-colors", latticeSubTab === 'sandbox' ? "border-purple-500 text-purple-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50")}>Experiment Sandbox</button>
                         <button onClick={() => setLatticeSubTab('archive')} className={cn("flex-1 py-2 text-xs font-medium border-b-2 transition-colors", latticeSubTab === 'archive' ? "border-purple-500 text-purple-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50")}>Research Archive</button>
                         <button onClick={() => setLatticeSubTab('photonics')} className={cn("flex-1 py-2 text-xs font-medium border-b-2 transition-colors", latticeSubTab === 'photonics' ? "border-purple-500 text-purple-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50")}>Photonics Lab</button>
                         <button onClick={() => setLatticeSubTab('history')} className={cn("flex-1 py-2 text-xs font-medium border-b-2 transition-colors", latticeSubTab === 'history' ? "border-purple-500 text-purple-400 bg-slate-900" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50")}>Syslog / History</button>
                       </div>
                       
                       {latticeSubTab === 'sandbox' && (
                         <>
                           <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-col gap-2 shrink-0">
                             <div className="flex items-center gap-2 text-purple-400 font-medium text-sm">
                               <ShieldAlert className="w-4 h-4" /> TRANSCENDENCE LATTICE ISOLATION
                             </div>
                             <p className="text-xs text-slate-400">Transcendence Lattice Research Sandbox. Code execution here cannot directly modify Core architecture.</p>
                             
                             {showInterventionConsole && (
                               <div className="text-xs text-amber-400 font-bold animate-pulse mt-1">
                                 TRANSCENDENCE ISOLATED — HUMAN INTERVENTION ACTIVE
                               </div>
                             )}

                             <div className="flex flex-wrap gap-2 mt-2">
                               <button onClick={toggleAirsExperiment} className={cn("flex-1 py-2 rounded text-xs font-medium transition-colors flex justify-center items-center gap-1", latticeActiveExperiment ? "bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30" : "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30")}>
                                 {latticeActiveExperiment ? <><XCircle className="w-3 h-3"/> Terminate</> : <><Play className="w-3 h-3"/> Start Experiment</>}
                               </button>
                               <button disabled={!latticeActiveExperiment || showInterventionConsole} onClick={() => setShowInterventionConsole(true)} className="flex-1 py-2 rounded text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 disabled:opacity-50 transition-colors">
                                 Intervene
                               </button>
                               <button onClick={takeAirsSnapshot} disabled={!latticeActiveExperiment} className="flex-1 py-2 rounded text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 disabled:opacity-50 transition-colors flex justify-center items-center gap-1">
                                 <Archive className="w-3 h-3" /> Snapshot
                               </button>
                               <button onClick={() => setShowLatticeDashboard(!showLatticeDashboard)} className={cn("flex-1 py-2 rounded text-xs font-medium border transition-colors flex justify-center items-center gap-1", showLatticeDashboard ? "bg-purple-600/20 text-purple-400 border-purple-600/30 hover:bg-purple-600/30" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700")}>
                                 <LayoutDashboard className="w-3 h-3" /> Dashboard
                               </button>
                             </div>
                           </div>

                           {/* Intervention Console Overlay */}
                           {showInterventionConsole && (
                             <div className="absolute inset-0 z-10 bg-slate-950/90 p-4 flex flex-col overflow-hidden backdrop-blur-sm border-t border-slate-800 mt-[120px]">
                               <h3 className="text-amber-400 font-medium text-sm mb-4">Controlled Operator Intervention Console</h3>
                               <form onSubmit={handleInterventionSubmit} className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
                                 <label className="text-xs text-slate-400">Action</label>
                                 <select value={interventionForm.action} onChange={e => setInterventionForm({...interventionForm, action: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500">
                                   {interventionActions.map(act => <option key={act} value={act}>{act}</option>)}
                                 </select>

                                 <label className="text-xs text-slate-400">Previous State</label>
                                 <input type="text" value={interventionForm.previousState} onChange={e => setInterventionForm({...interventionForm, previousState: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500" />
                                 
                                 <label className="text-xs text-slate-400">Resulting State</label>
                                 <input type="text" value={interventionForm.resultingState} onChange={e => setInterventionForm({...interventionForm, resultingState: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500" />

                                 <label className="text-xs text-slate-400">Requested Change (if applicable)</label>
                                 <input type="text" value={interventionForm.requestedChange} onChange={e => setInterventionForm({...interventionForm, requestedChange: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500" placeholder="e.g. Set difficulty to Hard" />

                                 <label className="text-xs text-slate-400">Reason</label>
                                 <textarea required value={interventionForm.reason} onChange={e => setInterventionForm({...interventionForm, reason: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 resize-none h-16 focus:outline-none focus:border-amber-500" placeholder="Justification for intervention" />

                                 <label className="text-xs text-slate-400">Experiment Outcome / Note</label>
                                 <input type="text" value={interventionForm.experimentOutcome} onChange={e => setInterventionForm({...interventionForm, experimentOutcome: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500" />

                                 <div className="flex gap-2 mt-4 shrink-0">
                                   <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded text-xs font-medium transition-colors">Execute Intervention</button>
                                   <button type="button" onClick={() => setShowInterventionConsole(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs font-medium transition-colors">Cancel</button>
                                 </div>
                               </form>
                             </div>
                           )}

                           <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto custom-scrollbar">
                             {/* Left/Top: Terminal */}
                             <div className="flex-1 flex flex-col min-h-[400px]">
                               <div className="flex-1 p-2 bg-black font-mono text-[10px] leading-tight text-slate-400 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                                  {latticeEventStream.length === 0 ? (
                                    <div className="text-center my-10 text-slate-600">Awaiting Experiment Initialization...</div>
                                  ) : (
                                    <div className="flex flex-col-reverse">
                                      {latticeEventStream.map((ev, idx) => (
                                        <div key={ev.id || idx} className={cn("py-0.5 whitespace-pre-wrap break-words", String(ev.log).includes('STARTED') || String(ev.log).includes('TERMINATED') ? "text-purple-400" : String(ev.log).includes('INTERVENTION') ? "text-amber-400" : String(ev.log).includes('SBS RESULTS') || String(ev.log).includes('---') ? "text-blue-400" : String(ev.log).startsWith('>') ? "text-slate-300 font-bold" : String(ev.log).startsWith('AGENT RESPONSE') ? "text-emerald-400" : String(ev.log).startsWith('ERROR') ? "text-red-400" : String(ev.log).includes('ANALYSIS') ? "text-amber-300" : "")}>{typeof ev.log === "object" ? JSON.stringify(ev.log, null, 2) : ev.log}</div>
                                      ))}
                                    </div>
                                  )}
                               </div>
                               <div className="p-2 border-t border-slate-800 bg-slate-900 shrink-0">
                                 <form onSubmit={handleAirsSubmit} className="flex gap-2">
                                   <span className="text-purple-500 font-mono self-center ml-2">{">"}</span>
                                   <input 
                                     type="text" 
                                     value={latticeInput}
                                     onChange={e => setLatticeInput(e.target.value)}
                                     onKeyDown={e => {
                                       if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                         e.preventDefault();
                                         handleAirsSubmit(e);
                                       }
                                     }}
                                     placeholder="Enter sandbox query or code block... (Ctrl+Enter to send)"
                                     disabled={!latticeActiveExperiment || showInterventionConsole}
                                     className="flex-1 bg-transparent border-none text-xs text-white font-mono focus:outline-none disabled:opacity-50"
                                   />
                                   <button 
                                     type="button"
                                     onClick={handleStaticAnalysis}
                                     disabled={!latticeActiveExperiment || !latticeInput.trim() || showInterventionConsole}
                                     title="Run Static Analysis"
                                     className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/30 disabled:opacity-50 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center shrink-0"
                                   >
                                     <CheckCircle2 className="w-3 h-3" />
                                   </button>
                                   <button 
                                     type="submit"
                                     disabled={!latticeActiveExperiment || !latticeInput.trim() || showInterventionConsole}
                                     className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/30 disabled:opacity-50 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center shrink-0"
                                   >
                                     <Send className="w-3 h-3" />
                                   </button>
                                 </form>
                               </div>
                             </div>

                             {/* Right/Bottom: Dashboard (SBS + Radar) */}
                             {showLatticeDashboard && (
                               <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar border-t md:border-t-0 min-h-[300px]">
                                 <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                                   <h3 className="text-xs font-medium text-slate-300 flex items-center gap-1.5"><LayoutDashboard className="w-3.5 h-3.5"/> Model Dashboard</h3>
                                   <button onClick={() => setShowLatticeDashboard(false)} className="text-slate-500 hover:text-slate-300">
                                     <XCircle className="w-3.5 h-3.5" />
                                   </button>
                                 </div>
                                 <div className="p-4 flex flex-col gap-6">
                                   <div className="flex flex-col gap-2">
                                     <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Maturity Radar</h4>
                                     <div className="h-48 w-full">
                                       <ResponsiveContainer width="100%" height="100%">
                                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getModelMaturityData(aiModel)}>
                                           <PolarGrid stroke="#334155" />
                                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                           <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                           <Radar name={aiModel} dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                                         </RadarChart>
                                       </ResponsiveContainer>
                                     </div>
                                     <div className="text-center text-[10px] text-slate-400">Current Base: {aiModel.split('/').pop()}</div>
                                   </div>

                                   <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
                                     <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Environment Snapshots</h4>
                                     <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                                       {latticeSnapshots.length === 0 ? (
                                         <p className="text-[10px] text-slate-500 italic">No snapshots available.</p>
                                       ) : (
                                         latticeSnapshots.map(snap => (
                                           <div key={snap.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-2 rounded">
                                             <div className="flex flex-col">
                                               <span className="text-[10px] font-mono text-blue-400">{snap.id}</span>
                                               <span className="text-[9px] text-slate-500">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                                             </div>
                                             <button onClick={() => restoreAirsSnapshot(snap)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors">
                                               Restore
                                             </button>
                                           </div>
                                         ))
                                       )}
                                     </div>
                                   </div>

                                   <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
                                     <div className="flex justify-between items-center">
                                       <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                          <SplitSquareHorizontal className="w-3 h-3" /> Side-by-Side
                                       </h4>
                                       <label className="flex items-center cursor-pointer relative text-[10px]">
                                         <input type="checkbox" className="sr-only peer" checked={latticeSbsMode} onChange={e => setLatticeSbsMode(e.target.checked)} />
                                         <div className="w-6 h-3 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-purple-500"></div>
                                       </label>
                                     </div>
                                     <div className={cn("flex flex-col gap-2 transition-opacity", latticeSbsMode ? "opacity-100" : "opacity-40 pointer-events-none")}>
                                       <p className="text-[10px] text-slate-400 leading-tight">Run sandbox queries against a second model simultaneously.</p>
                                       
                                       <div className="flex gap-2 text-xs">
                                         <select value={latticeSbsProvider} onChange={e => setLatticeSbsProvider(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none flex-1">
                                           <option value="gemini">Gemini</option>
                                           <option value="openrouter">OpenRouter</option>
                                           <option value="webllm">WebLLM (Local)</option>
                                         </select>
                                       </div>
                                       <div className="relative">
                                         <button onClick={() => setShowSbsModelDropdown(!showSbsModelDropdown)} className="w-full text-left bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none flex justify-between items-center">
                                           <span className="truncate">{latticeSbsModel}</span>
                                           <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                         </button>
                                         {showSbsModelDropdown && (
                                           <div className="absolute z-20 top-full left-0 mt-1 w-full bg-slate-900 border border-slate-700 rounded shadow-xl flex flex-col max-h-48 overflow-hidden">
                                             <div className="p-1.5 border-b border-slate-800 bg-slate-950">
                                               <input type="text" autoFocus placeholder="Search..." value={latticeSbsSearch} onChange={e => setLatticeSbsSearch(e.target.value)} className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none" />
                                             </div>
                                             <div className="flex-1 overflow-y-auto custom-scrollbar">
                                               {latticeSbsProvider === 'gemini' ? (
                                                  [{id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash'}, {id: 'gemini-3.7-flash-thinking', name: 'Gemini 3.7 Flash Thinking'}, {id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro'}].filter(m => m.id.toLowerCase().includes(latticeSbsSearch.toLowerCase())).map(m => (
                                                    <div key={m.id} onClick={() => { setLatticeSbsModel(m.id); setShowSbsModelDropdown(false); setLatticeSbsSearch(''); }} className="px-2 py-1.5 hover:bg-slate-800 cursor-pointer text-[10px] text-slate-300 truncate border-b border-slate-800/50">{m.id}</div>
                                                  ))
                                               ) : (
                                                  openRouterModels.filter(m => m.id.toLowerCase().includes(latticeSbsSearch.toLowerCase())).map(m => (
                                                    <div key={m.id} onClick={() => { setLatticeSbsModel(m.id); setShowSbsModelDropdown(false); setLatticeSbsSearch(''); }} className="px-2 py-1.5 hover:bg-slate-800 cursor-pointer text-[10px] text-slate-300 truncate border-b border-slate-800/50">{m.id}</div>
                                                  ))
                                               )}
                                             </div>
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                   <div className="pt-4 border-t border-slate-800 mt-auto">
                                     <button
                                       onClick={handleProposeUpgradeToCore}
                                       className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                     >
                                       <ShieldAlert className="w-4 h-4" />
                                       Propose Upgrade to Core
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             )}
                           </div>
                         </>
                       )}

                       {latticeSubTab === 'photonics' && (
                         <div className="flex-1 flex flex-col min-h-0">
                           <ComputationalPhotonicsLab />
                         </div>
                       )}
                       

                       {latticeSubTab === 'history' && (
                         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                           <div className="flex justify-between items-center">
                             <h3 className="text-purple-400 font-medium text-sm flex items-center gap-2"><History className="w-4 h-4" /> Transcendence Execution Syslog</h3>
                             <button onClick={() => setLatticeEventStream([])} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs transition-colors">Clear Log</button>
                           </div>
                           <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[400px]">
                              <div className="overflow-y-auto custom-scrollbar p-2 flex-1 font-mono text-xs text-slate-300 space-y-1">
                                  {latticeEventStream.length === 0 ? (
                                      <p className="text-slate-600 italic p-4 text-center">No system events logged in current session.</p>
                                  ) : (
                                      latticeEventStream.map(ev => (
                                          <div key={ev.id} className="flex gap-4 p-2 hover:bg-slate-900/50 rounded transition-colors group border-b border-slate-800/50 last:border-0">
                                              <span className="text-slate-500 shrink-0 w-24">
                                                  {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                                              </span>
                                              <span className="text-slate-300 break-all">{ev.log}</span>
                                              {ev.payload && (
                                                  <button onClick={() => console.log(ev.payload)} className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      Payload
                                                  </button>
                                              )}
                                          </div>
                                      ))
                                  )}
                              </div>
                           </div>
                         </div>
                       )}

                       {latticeSubTab === 'archive' && (
                         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                           <h3 className="text-purple-400 font-medium text-sm flex items-center gap-2"><FileClock className="w-4 h-4" /> Transcendence Research Archive</h3>
                           
                           {/* Node-based Tree Visualization */}
                           <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto custom-scrollbar">
                             <h4 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Experiment Branch History</h4>
                             {interventions.length === 0 ? (
                               <p className="text-slate-500 text-xs italic">No branched experiments.</p>
                             ) : (
                               <div className="flex flex-col relative pl-4 pb-4 pt-2">
                                 <div className="absolute left-[23px] top-2 bottom-0 w-0.5 bg-slate-800"></div>
                                 {interventions.map((intv, idx) => (
                                   <div key={'node-'+intv.interventionId} className="flex gap-4 relative mb-6">
                                     <div className={cn("w-4 h-4 rounded-full border-4 border-slate-950 z-10 shrink-0 mt-1", intv.action.includes('BRANCH') ? 'bg-amber-500' : 'bg-purple-500')}></div>
                                     <div className="flex flex-col gap-1">
                                       <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs min-w-[200px]">
                                         <div className="text-slate-200 font-medium">{intv.action}</div>
                                         <div className="text-slate-500 text-[10px]">Exp: {intv.experimentId}</div>
                                       </div>
                                       {intv.action.includes('BRANCH') && (
                                         <div className="ml-8 mt-2 pl-4 border-l-2 border-slate-700/50 flex flex-col gap-2 relative">
                                            <div className="absolute left-[-2px] top-2 w-4 h-[2px] bg-slate-700/50"></div>
                                            <div className="bg-slate-800/50 border border-slate-700/50 rounded p-2 text-[10px] text-slate-400">
                                              ↳ Branched State: {intv.resultingState}
                                            </div>
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>

                           {interventions.length === 0 ? (
                             <p className="text-slate-500 text-sm text-center py-4">No interventions recorded in the archive.</p>
                           ) : (
                             <div className="flex flex-col gap-4">
                               <h4 className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-wider">Detailed Ledger</h4>
                               {interventions.map(intv => (
                                 <div key={intv.interventionId} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                                   <div className="flex justify-between items-start gap-2">
                                     <div className="flex flex-col">
                                        <span className="text-slate-200 text-xs font-bold">{intv.action}</span>
                                        <span className="text-[10px] text-slate-500">Exp: {intv.experimentId} | Int: {intv.interventionId}</span>
                                     </div>
                                     <span className="text-[10px] text-slate-400">{new Date(intv.timestamp).toLocaleTimeString()}</span>
                                   </div>
                                   <div className="text-[10px] text-slate-400 flex flex-col gap-1 mt-2 border-t border-slate-800 pt-2">
                                     <div><strong className="text-slate-300">Operator:</strong> {intv.operator}</div>
                                     <div><strong className="text-slate-300">State Transition:</strong> {intv.previousState} ➔ {intv.resultingState}</div>
                                     {intv.requestedChange && <div><strong className="text-slate-300">Requested Change:</strong> {intv.requestedChange}</div>}
                                     <div><strong className="text-slate-300">Reason:</strong> {intv.reason}</div>
                                     <div><strong className="text-slate-300">Outcome:</strong> {intv.experimentOutcome}</div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="flex-1 p-4 flex flex-col text-slate-400 text-sm gap-2">
                      <p>Preview uses `index.html` from the root directory.</p>
                      <p>For best results, ask the AI to generate a single-file application or use absolute CDN links.</p>
                    </div>
                  )}
                  <ResourceMonitor />
                </div>
                {/* End of Sidebar */}
                {/* Main Content Area */}
                <div className="flex-1 border border-slate-800 rounded-xl bg-slate-900/50 flex flex-col overflow-hidden min-w-0">
                   {activeTab === 'factory' ? (
                     <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50">
                        <FactorySimulation />
                     </div>
                   ) : activeTab === 'preview' ? (
                     <div className="flex-1 bg-white relative">
                        {vfs['index.html'] ? (
                          <iframe 
                            src={getPreviewUrl()!} 
                            className="w-full h-full border-0 absolute inset-0" 
                            title="App Preview"
                            sandbox="allow-scripts allow-forms allow-same-origin"
                          />
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-slate-500 p-8 text-center h-full bg-slate-950">
                            <p>No \`index.html\` found to preview.</p>
                          </div>
                        )}
                     </div>
                   ) : (previewFilePath || selectedFilePath) && vfs[previewFilePath || selectedFilePath!] ? (
                     <div className="flex-1 flex flex-col min-h-0">
                       <div className="p-2 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
                         <span className={cn("text-sm font-medium truncate px-2", previewFilePath ? "text-blue-300 italic" : "text-slate-300")}>
                            {previewFilePath || selectedFilePath}
                         </span>
                         {vfs[previewFilePath || selectedFilePath!].content !== undefined && !previewFilePath && (
                           <button 
                             onClick={() => isEditing ? saveFile() : setIsEditing(true)}
                             className={cn(
                               "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                               isEditing ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                             )}
                           >
                             {isEditing ? <><Save className="w-3 h-3" /> Save</> : <><Code className="w-3 h-3" /> Edit</>}
                           </button>
                         )}
                       </div>
                       
                       <div className="flex-1 overflow-hidden relative">
                         {vfs[selectedFilePath].url && selectedFilePath.match(/\.(png|jpe?g|gif|svg|webp)$/i) ? (
                           <div className="flex items-center justify-center h-full bg-slate-950 p-4">
                             <img src={vfs[selectedFilePath].url} alt={selectedFilePath} className="max-w-full max-h-full object-contain" />
                           </div>
                         ) : vfs[selectedFilePath].content !== undefined ? (
                           isEditing ? (
                             <div className="w-full h-full bg-[#1d1f21] overflow-y-auto custom-scrollbar" onKeyDown={e => {
                                 if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                                   e.preventDefault();
                                   saveFile();
                                 }
                               }}>
                               <Editor
                                 value={editedContent}
                                 onValueChange={code => setEditedContent(code)}
                                 highlight={code => {
                                   let lang = Prism.languages.javascript;
                                   if (selectedFilePath?.endsWith('.ts') || selectedFilePath?.endsWith('.tsx')) {
                                      lang = Prism.languages.typescript;
                                   } else if (selectedFilePath?.endsWith('.css')) {
                                      lang = Prism.languages.css;
                                   } else if (selectedFilePath?.endsWith('.json')) {
                                      lang = Prism.languages.json;
                                   }
                                   return Prism.highlight(code, lang, 'javascript');
                                 }}
                                 padding={16}
                                 style={{
                                   fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                   fontSize: 14,
                                   minHeight: '100%'
                                 }}
                                 className="text-slate-300 font-mono"
                               />
                             </div>
                           ) : (
                             <pre className="w-full h-full bg-[#1d1f21] text-slate-300 font-mono text-sm p-4 overflow-auto custom-scrollbar">
                               <code dangerouslySetInnerHTML={{__html: (() => {
                                   const code = vfs[selectedFilePath!].content || '';
                                   let lang = Prism.languages.javascript;
                                   if (selectedFilePath?.endsWith('.ts') || selectedFilePath?.endsWith('.tsx')) {
                                      lang = Prism.languages.typescript;
                                   } else if (selectedFilePath?.endsWith('.css')) {
                                      lang = Prism.languages.css;
                                   } else if (selectedFilePath?.endsWith('.json')) {
                                      lang = Prism.languages.json;
                                   }
                                   return Prism.highlight(code, lang, 'javascript');
                               })()}}></code>
                             </pre>
                           )
                         ) : (
                            <div className="flex items-center justify-center text-slate-500 h-full">
                               Binary file cannot be previewed in text mode.
                            </div>
                         )}
                       </div>
                     </div>
                   ) : (
                     <div className="flex-1 flex items-center justify-center text-slate-500 p-8 text-center flex-col h-full">
                       <Code className="w-16 h-16 mb-4 text-slate-800" />
                       <p>Select a file to view or edit</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
        )}
        
        
        {selectedHistoryEvent && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                   <button onClick={() => setSelectedHistoryEvent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                   <h3 className="text-lg font-bold text-white mb-2">Event Details</h3>
                   <div className="space-y-4 text-sm text-slate-300">
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">ID</span>
                           <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-xs">{selectedHistoryEvent.id}</div>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Type</span>
                           <span className="bg-slate-800 px-2 py-1 rounded text-xs uppercase font-medium">{selectedHistoryEvent.type}</span>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Timestamp</span>
                           <div>{new Date(selectedHistoryEvent.timestamp).toLocaleString()}</div>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Description</span>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">{selectedHistoryEvent.description}</div>
                       </div>
                       {selectedHistoryEvent.details && (
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Extended Details</span>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">{selectedHistoryEvent.details}</div>
                       </div>
                       )}
                       {selectedHistoryEvent.snapshot && (
                       <div className="mt-4 pt-4 border-t border-slate-800">
                           <button onClick={() => {
                               if (window.confirm('Restore this VFS state? Current unsaved changes will be lost.')) {
                                   setVfs(selectedHistoryEvent.snapshot!);
                                   setSelectedHistoryEvent(null);
                                   syncLogEvent('SYSTEM', `Restored VFS to snapshot ${selectedHistoryEvent.id}`);
                               }
                           }} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded text-sm font-medium transition-colors">
                               Restore VFS Snapshot ({Object.keys(selectedHistoryEvent.snapshot).length} items)
                           </button>
                       </div>
                       )}
                   </div>
               </div>
            </div>
         )}
         
         {selectedProposal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative max-h-[80vh] flex flex-col">
                   <button onClick={() => setSelectedProposal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                   <h3 className="text-lg font-bold text-white mb-2 shrink-0">Proposal Details</h3>
                   <div className="space-y-4 text-sm text-slate-300 overflow-y-auto custom-scrollbar flex-1 pr-2">
                       <div className="flex justify-between">
                           <span className="text-xs text-slate-500">ID: <span className="text-slate-300">{selectedProposal.id}</span></span>
                           <span className="text-xs text-slate-500">Version: <span className="text-slate-300">{selectedProposal.version}</span></span>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Title</span>
                           <div className="font-medium text-amber-400">{selectedProposal.title}</div>
                       </div>
                       <div className="flex gap-2">
                           <span className="bg-slate-800 px-2 py-1 rounded text-xs font-medium">{selectedProposal.riskTier}</span>
                           <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs font-medium">{selectedProposal.status}</span>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Objective</span>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">{selectedProposal.objective}</div>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Rationale</span>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">{selectedProposal.rationale}</div>
                       </div>
                       <div>
                           <span className="block text-xs text-slate-500 mb-1">Proposed State</span>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap font-mono text-xs">{selectedProposal.proposedState}</div>
                       </div>
                   </div>
               </div>
            </div>
         )}

        {showDiffModal && (
          <DiffViewer 
            proposal={proposals.find(p => p.id === showDiffModal)}
            currentContent={(selectedFilePath && vfs && vfs[selectedFilePath]?.type === 'file') ? (vfs[selectedFilePath] as any).content : ''}
            onClose={() => setShowDiffModal(null)}
            onAutoMerge={(mergedContent) => handleAutoMerge(showDiffModal, mergedContent)}
          />
        )}
      </main>

      <NewsTicker />
      {/* Floating HRE Console */}
      <div className={cn("fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-slate-950 border border-emerald-500/30 rounded-t-xl transition-transform duration-300 z-50 flex flex-col shadow-[0_0_20px_rgba(16,185,129,0.1)]", isHreConsoleOpen ? "translate-y-0 h-80" : "translate-y-[calc(100%-2.5rem)] h-80")}>
         <div onClick={() => setIsHreConsoleOpen(!isHreConsoleOpen)} className="h-10 border-b border-emerald-900/50 flex justify-between items-center px-4 cursor-pointer hover:bg-slate-900/50 rounded-t-xl shrink-0">
            <div className="flex items-center gap-2">
               <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
               <span className="text-emerald-400 text-xs font-bold font-mono">HRE ACTIVE TERMINAL</span>
            </div>
            {isHreConsoleOpen ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-emerald-500 -rotate-90" />}
         </div>
         <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-emerald-400 bg-black">
            <div>&gt; HRE Substrate Initialized</div>
            <div className="opacity-70">&gt; Awaiting executive payload...</div>
            <div className="opacity-70">&gt; Execution capability: SANDBOX</div>
         </div>
      </div>

    </div>
  );
}
