# PROPOSAL: AEON AIRS + Research-to-Core Promotion Architecture

## Identity
**Proposal ID:** AEON-PROP-001
**Title:** AEON AIRS + Research-to-Core Promotion Architecture
**Version:** R1
**Risk Tier:** Tier 3 — High Risk
**Status:** DRAFT

## Objective
Establish the AEON AI Research Sandbox (AIRS) as a dedicated, isolated AI research environment with real-time observability and controlled operator interaction, while creating a governed Research-to-Core Promotion Engine that allows validated and human-approved capabilities, proposals, and architectural improvements to be safely staged, canaried, verified, integrated, monitored, and rolled back within AEON Core.

## Rationale
AEON requires a safe mechanism for researching advanced AI capabilities without exposing the production Core to experimental behaviour. AIRS will provide isolated capability discovery, benchmarking, prompt research, agent research, workflow research, red-team testing, simulation, emergence observation, evolution tracking, analytics, archival, reproduction, and capability transfer testing.

A separate Research-to-Core Promotion Engine is required so that validated research can influence AEON Core without allowing AIRS or experimental agents to directly modify production architecture.

The architecture will preserve human authority by requiring explicit human approval for consequential changes and will use staging, canary validation, verification, monitoring, and rollback before and after Core promotion.

## Current State
AEON already contains a Governance/Proposal Engine, Upgrade Proposals, Master Builder concepts, Agent Registry, Copilot Prime, Discovery Engine, Engineering Lab, Executive Action Layer, History, Knowledge/RAG systems and other architectural components.

However, the current architecture does not yet provide the complete dedicated AIRS research plane, comprehensive real-time AIRS command interface, formal research-to-Core promotion pipeline, capability reproduction/transfer laboratories, controlled canary promotion mechanism, or complete research-to-approved-change lineage required by the proposed architecture.

Existing compatible functionality must therefore be inspected and extended rather than duplicated or blindly replaced.

## Proposed State
AEON shall contain two clearly separated domains:
1. AEON CORE
2. AEON AI RESEARCH SANDBOX (AIRS)

AIRS shall operate as an isolated research runtime with its own experiment orchestration, capability discovery, benchmarking, prompt research, agent research, workflow research, red-team testing, emergence observation, simulation, evolution tracking, analytics, archive, capability registry, scientific-method engine, publication engine, capability reproduction laboratory and capability transfer laboratory.

A dedicated AIRS interface shall allow the human operator to observe experiments in real time and perform controlled interventions including pause, resume, stop, restart, challenge, replicate, compare, branch and approved research intervention.

AIRS shall not directly modify AEON Core.

A Research-to-Core Promotion Engine shall provide the controlled pathway:
AIRS discovery → evidence → reproduction → validation → proposal → skeptical review → refinement → human approval → integrity check → security/dependency validation → staging → canary → verification → Core promotion → monitoring → rollback if required.

All consequential proposals shall retain immutable version lineage and human approval shall apply to the exact approved proposal version.

The existing Proposal Engine shall be extended rather than duplicated. Existing AEON components shall be inspected and reused wherever compatible.

## Configuration Updates
The following initial configuration flags are proposed:

AIRS_ENABLED=true
AIRS_CORE_DIRECT_WRITE=false
AIRS_REALTIME_OBSERVATION=true
AIRS_OPERATOR_INTERVENTION=true
RESEARCH_TO_CORE_PROMOTION=true
HUMAN_APPROVAL_REQUIRED_FOR_TIER_3=true
STAGING_REQUIRED_FOR_TIER_2_PLUS=true
CANARY_REQUIRED_FOR_TIER_3=true
ROLLBACK_REQUIRED_FOR_TIER_2_PLUS=true
EXACT_PROPOSAL_VERSION_APPROVAL=true
CAPABILITY_REPRODUCTION_REQUIRED=true
CAPABILITY_TRANSFER_TESTING_ENABLED=true

## Reversibility
The change must be fully reversible.

AIRS must be independently disableable without affecting AEON Core.

The Research-to-Core Promotion Engine must be disableable without destroying AIRS research data.

All Core modifications must have a known-good pre-change snapshot and rollback point.

No experimental AIRS component may become a permanent Core dependency without passing the defined promotion and verification process.

If staging or canary validation fails, the proposed capability must be prevented from entering the production Core and the system must return to the previous verified baseline.

All proposal, implementation, approval, deployment and rollback records must remain in the architectural event history.
