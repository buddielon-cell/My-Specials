import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace runAirsExperiment fetch
airs_fetch_old = """          const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: `[SANDBOX ENVIRONMENT. Do NOT output JSON file actions. Just reply as the AIRS research assistant.] ${query}`, 
              vfs: null,
              chatHistory: [],
              provider: prov,
              model: mod,
              customApiKey
            })
          });
          const data = await res.json();
          return { text: data.text, error: data.error, time: Date.now() - start, ok: res.ok };"""
airs_fetch_new = """          const { ok, text, error } = await callAI(`[SANDBOX ENVIRONMENT. Do NOT output JSON file actions. Just reply as the AIRS research assistant.] ${query}`, null, [], prov, mod);
          return { text: text || "", error, time: Date.now() - start, ok };"""
content = content.replace(airs_fetch_old, airs_fetch_new)

# Renaming strings
content = content.replace("AEON AI", "Transcendence Lattice")
content = content.replace("AIRS Sandbox", "Transcendence Sandbox")
content = content.replace("AIRS ISOLATED ENVIRONMENT", "TRANSCENDENCE LATTICE ISOLATION")
content = content.replace("AIRS ISOLATED", "TRANSCENDENCE ISOLATED")
content = content.replace("AIRS", "Transcendence")
content = content.replace("addAirsEvent", "addTranscendenceEvent")
content = content.replace("airsActiveExperiment", "latticeActiveExperiment")
content = content.replace("setAirsActiveExperiment", "setLatticeActiveExperiment")
content = content.replace("airsEventStream", "latticeEventStream")
content = content.replace("setAirsEventStream", "setLatticeEventStream")
content = content.replace("airsInput", "latticeInput")
content = content.replace("setAirsInput", "setLatticeInput")
content = content.replace("showAirsDashboard", "showLatticeDashboard")
content = content.replace("setShowAirsDashboard", "setShowLatticeDashboard")
content = content.replace("airsSnapshots", "latticeSnapshots")
content = content.replace("setAirsSnapshots", "setLatticeSnapshots")
content = content.replace("airsSbsMode", "latticeSbsMode")
content = content.replace("setAirsSbsMode", "setLatticeSbsMode")
content = content.replace("airsSbsProvider", "latticeSbsProvider")
content = content.replace("setAirsSbsProvider", "setLatticeSbsProvider")
content = content.replace("airsSbsModel", "latticeSbsModel")
content = content.replace("setAirsSbsModel", "setLatticeSbsModel")
content = content.replace("airsSbsSearch", "latticeSbsSearch")
content = content.replace("setAirsSbsSearch", "setLatticeSbsSearch")
content = content.replace("airsSubTab", "latticeSubTab")
content = content.replace("setAirsSubTab", "setLatticeSubTab")
content = content.replace("currentAirsExperimentId", "currentLatticeExperimentId")
content = content.replace("setCurrentAirsExperimentId", "setCurrentLatticeExperimentId")
content = content.replace("AirsIntervention", "LatticeIntervention")
content = content.replace("runAirsExperiment", "runLatticeExperiment")


with open('src/App.tsx', 'w') as f:
    f.write(content)

