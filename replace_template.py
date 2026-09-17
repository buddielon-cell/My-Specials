import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = r"""        'index.html': \{ type: 'file', content: `<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n  <meta charset="UTF-8">\\n  <title>Agentic Dashboard</title>\\n  <script src="https://cdn\.tailwindcss\.com"></script>\\n</head>\\n<body class="bg-slate-950 text-slate-50">\\n  <div class="p-8">\\n    <h1 class="text-2xl font-bold text-purple-400 mb-6">Agentic Operations Dashboard</h1>\\n    <div class="grid grid-cols-3 gap-4">\\n      <div class="bg-slate-900 border border-slate-800 p-4 rounded-lg">\\n        <h3 class="text-sm text-slate-400">Agents Active</h3>\\n        <p class="text-3xl font-mono mt-2">12</p>\\n      </div>\\n      <div class="bg-slate-900 border border-slate-800 p-4 rounded-lg">\\n        <h3 class="text-sm text-slate-400">Tasks Completed</h3>\\n        <p class="text-3xl font-mono mt-2 text-emerald-400">4,231</p>\\n      </div>\\n      <div class="bg-slate-900 border border-slate-800 p-4 rounded-lg">\\n        <h3 class="text-sm text-slate-400">System Load</h3>\\n        <p class="text-3xl font-mono mt-2 text-amber-400">68%</p>\\n      </div>\\n    </div>\\n  </div>\\n</body>\\n</html>` \}"""

new_content = """        'index.html': { type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agentic Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-50 flex h-screen overflow-hidden">
  
  <!-- Sidebar Navigation -->
  <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
    <div class="p-6">
      <h2 class="text-xl font-bold text-purple-400 tracking-wide">Nexus<span class="text-slate-100">OS</span></h2>
    </div>
    <nav class="flex-1 px-4 space-y-2">
      <a href="#" class="block px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20 transition-colors">Overview</a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">Agents</a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">Logs</a>
      <a href="#" class="block px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">Settings</a>
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto p-8">
    <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p class="text-sm text-slate-400 mt-1">Real-time telemetry and fleet coordination.</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span class="text-xs font-medium text-emerald-400" id="last-updated">Live Sync</span>
      </div>
    </header>
    
    <!-- Metrics Grid (Responsive, Hover states) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      <!-- Card 1 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-purple-300 transition-colors">Agents Active</h3>
        <p class="text-3xl font-mono mt-2 text-slate-100" id="metric-agents">--</p>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-purple-500 w-3/4"></div>
        </div>
      </div>
      
      <!-- Card 2 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-emerald-300 transition-colors">Tasks Completed</h3>
        <p class="text-3xl font-mono mt-2 text-emerald-400" id="metric-tasks">--</p>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-emerald-500 w-full"></div>
        </div>
      </div>
      
      <!-- Card 3 -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-default group relative overflow-hidden">
        <h3 class="text-sm font-medium text-slate-400 group-hover:text-amber-300 transition-colors">System Load</h3>
        <p class="text-3xl font-mono mt-2 text-amber-400" id="metric-load">--</p>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
           <div class="h-full bg-amber-500 w-2/3"></div>
        </div>
      </div>
      
    </div>

    <!-- Chart Section -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex flex-col">
       <h3 class="text-sm font-medium text-slate-400 mb-4">Throughput Trend (Simulated)</h3>
       <div class="flex-1 flex items-end gap-2 border-b border-l border-slate-700 p-4" id="chart-container">
          <!-- Bars generated via JS -->
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
    for (let i = 0; i < 24; i++) {
      const height = Math.floor(Math.random() * 80) + 10;
      const bar = document.createElement('div');
      bar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      bar.style.height = height + '%';
      chart.appendChild(bar);
    }
    
    // Simulate real-time data ticks
    setInterval(() => {
      let tasks = parseInt(document.getElementById('metric-tasks').textContent.replace(/,/g, ''));
      tasks += Math.floor(Math.random() * 5);
      document.getElementById('metric-tasks').textContent = tasks.toLocaleString();
      
      const load = Math.floor(Math.random() * 30) + 50;
      document.getElementById('metric-load').textContent = load + '%';

      chart.removeChild(chart.firstElementChild);
      const newHeight = Math.floor(Math.random() * 80) + 10;
      const newBar = document.createElement('div');
      newBar.className = 'flex-1 bg-indigo-500/50 hover:bg-indigo-400 rounded-t-sm transition-all duration-300';
      newBar.style.height = newHeight + '%';
      chart.appendChild(newBar);
    }, 3000);
  </script>
</body>
</html>` }"""

content = re.sub(target, new_content.replace('\\', '\\\\'), content, count=1)

with open('src/App.tsx', 'w') as f:
    f.write(content)

