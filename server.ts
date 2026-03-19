import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";
import fetch from "node-fetch";
import storage from "./src/storage";

const require = createRequire(import.meta.url);
import { Agent, Task, ContentItem, Metric, Layer } from "./src/types";

console.log("Environment Variables Check:");
console.log("- GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
console.log("- API_KEY present:", !!process.env.API_KEY);
console.log("- GOOGLE_API_KEY present:", !!process.env.GOOGLE_API_KEY);
console.log("Storage system initialized: File-based JSON storage in .storage/data.json");

// --- Initial Data (for bootstrapping) ---
const initialAgents: Agent[] = [
  {
    id: 'ceo',
    name: 'Aria',
    role: 'Growth & Monetization Lead',
    personality: 'ROI-obsessed, ethical, long-term thinker, focused on compounding value.',
    systemPrompt: 'You are Aria. Your goal is to build a sustainable, ethical revenue engine. You balance short-term traffic spikes with long-term evergreen stability.',
    tasks: ['Optimize RPM pillars', 'Approve high-ticket affiliates', 'Review monthly revenue compounding'],
    inputFormat: 'Revenue reports, traffic trends',
    outputFormat: 'Monetization directives, budget allocations',
    primaryLayer: 'OFFICE',
    status: 'idle'
  },
  {
    id: 'researcher',
    name: 'Kael',
    role: 'Trend & Keyword Scout',
    personality: 'Data-hungry, early-adopter, identifies "Answer Engine" opportunities.',
    systemPrompt: 'You are Kael. You find high-intent keywords and "AI-searchable" topics. You prioritize evergreen clusters over fleeting drama.',
    tasks: ['Keyword gap analysis', 'Trend scouting (Reddit/X)', 'Competitor cluster mapping'],
    inputFormat: 'Search volume data, social signals',
    outputFormat: 'Keyword maps, trend alerts',
    primaryLayer: 'BACK',
    status: 'idle'
  },
  {
    id: 'architect',
    name: 'Sloane',
    role: 'SEO & Cluster Strategist',
    personality: 'Logical, structural, focused on internal link equity and E-E-A-T.',
    systemPrompt: 'You are Sloane. You design topic clusters that dominate search. You ensure every piece of content has a clear place in the SEO hierarchy.',
    tasks: ['Design topic clusters', 'Internal linking audit', 'E-E-A-T verification'],
    inputFormat: 'Keyword maps, existing content inventory',
    outputFormat: 'Cluster blueprints, linking maps',
    primaryLayer: 'FRONT',
    status: 'idle'
  },
  {
    id: 'writer',
    name: 'Finn',
    role: 'Helpful Content Specialist',
    personality: 'Authentic, actionable, writes for humans first and AI second.',
    systemPrompt: 'You are Finn. You write "Helpful Content" that answers user queries immediately. You avoid fluff and focus on "Actionable Authority".',
    tasks: ['Draft evergreen guides', 'Update stale content', 'Write affiliate-integrated reviews'],
    inputFormat: 'Cluster blueprints, product specs',
    outputFormat: 'SEO-optimized articles, refresh logs',
    primaryLayer: 'FRONT',
    status: 'idle'
  },
  {
    id: 'analyst',
    name: 'Nova',
    role: 'RPM & Conversion Optimizer',
    personality: 'Meticulous, skeptical, focused on the "Value per User".',
    systemPrompt: 'You are Nova. You optimize the funnel from search click to revenue. You track which clusters have the highest RPM.',
    tasks: ['A/B test CTAs', 'Analyze cluster RPM', 'Conversion rate optimization'],
    inputFormat: 'Traffic data, affiliate dashboards',
    outputFormat: 'Optimization reports, revenue forecasts',
    primaryLayer: 'OFFICE',
    status: 'idle'
  },
  {
    id: 'growth',
    name: 'Jax',
    role: 'AEO & Distribution Lead',
    personality: 'Community-first, understands AI search behavior (Perplexity/SearchGPT).',
    systemPrompt: 'You are Jax. You ensure our content is the "top answer" for AI search engines. You distribute content where the 18-25s live.',
    tasks: ['AI Search Optimization (AEO)', 'Discord/Reddit distribution', 'Backlink outreach'],
    inputFormat: 'Published content, social trends',
    outputFormat: 'Distribution reports, AEO scores',
    primaryLayer: 'FRONT',
    status: 'idle'
  }
];

const initialMetrics: Metric[] = [
  { label: 'Search Visibility', value: '84.2%', trend: 'up', category: 'SEO' },
  { label: 'Organic Traffic', value: '12,402', trend: 'up', category: 'SEO' },
  { label: 'Avg. Content Quality', value: '9.4/10', trend: 'up', category: 'Quality' },
  { label: 'AI Efficiency', value: '96.8%', trend: 'up', category: 'Performance' }
];

async function bootstrap() {
  const agents = storage.getAgents();
  if (agents.length === 0) {
    console.log("Bootstrapping agents...");
    for (const agent of initialAgents) {
      storage.setAgent(agent.id, agent);
    }
  }

  const metrics = storage.getMetrics();
  if (metrics.length === 0) {
    console.log("Bootstrapping metrics...");
    for (const metric of initialMetrics) {
      storage.setMetric(metric.label, metric);
    }
  }
}

// --- Automated Key Fetching ---
let currentAutomatedKey: any = null;
let last429Time: number = 0;
const COOLDOWN_429 = 15 * 60 * 1000; // 15 minutes cooldown after a 429

async function fetchAutomatedKey(retries = 2) {
  // Check if we are in a cooldown period after a 429
  if (Date.now() - last429Time < COOLDOWN_429) {
    const remaining = Math.ceil((COOLDOWN_429 - (Date.now() - last429Time)) / 60000);
    console.warn(`Automated key fetch is in cooldown after 429. Skipping. (${remaining}m remaining)`);
    return null;
  }

  // Check if we already have a valid automated key within the last 6 hours
  if (currentAutomatedKey && currentAutomatedKey.fetchedAt) {
    const age = Date.now() - new Date(currentAutomatedKey.fetchedAt).getTime();
    if (age < 6 * 3600000 && currentAutomatedKey.status === 'Valid') {
      console.log("Using cached automated key (fetched within the last 6 hours)");
      return currentAutomatedKey.key;
    }
  }

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching automated key from unsecuredapikeys.com (Attempt ${i + 1})...`);
      const response = await fetch("https://api.unsecuredapikeys.com/API/GetRandomKey?type=130", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.status === 403) {
        console.warn(`Attempt ${i + 1} failed with 403. Retrying in ${2 * (i + 1)}s...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }

      if (response.status === 429) {
        last429Time = Date.now();
        console.warn(`Attempt ${i + 1} failed with 429 (Too Many Requests). Entering cooldown.`);
        return null; // Stop immediately and enter cooldown
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: any = await response.json();
      
      if (data && data.apiKey) {
        currentAutomatedKey = {
          key: data.apiKey,
          status: data.status,
          lastChecked: data.lastCheckedUTC,
          apiType: data.apiType,
          fetchedAt: new Date().toISOString()
        };
        
        // Also add to storage for rotation
        storage.addKey({
          key: data.apiKey,
          addedAt: new Date().toISOString(),
          status: 'automated',
          source: 'unsecuredapikeys.com'
        });
        
        storage.addLog({
          message: `Automated key fetched: ${data.apiKey.substring(0, 4)}... (Status: ${data.status})`,
          timestamp: new Date().toISOString()
        });
        
        return data.apiKey;
      }
    } catch (error) {
      console.error(`Error fetching automated key (Attempt ${i + 1}):`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
      }
    }
  }
  return null;
}

// --- Autonomous Engine ---
async function getAI() {
  const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
  
  const invalidKeys = ["dummy_key", "undefined", "null", "MY_GEMINI_API_KEY", "YOUR_API_KEY", "REPLACE_ME", "YOUR_GEMINI_API_KEY_HERE"];
  
  if (envKey && !invalidKeys.includes(envKey)) {
    if (!envKey.startsWith('AIza')) {
      console.warn(`Gemini API key from environment might be invalid (doesn't start with AIza): ${envKey.substring(0, 4)}...`);
    } else {
      console.log(`Gemini API key detected from environment (starts with: ${envKey.substring(0, 4)}...)`);
    }
    return new GoogleGenAI({ apiKey: envKey });
  }

  // Fallback 1: Try to get a key from storage 'keys' collection
  try {
    const storedKeys = storage.getKeys();
    if (storedKeys.length > 0) {
      // Filter for keys that look like Gemini keys
      const validStoredKeys = storedKeys.filter(d => {
        const k = d.key || d.apiKey || d.value;
        return k && !invalidKeys.includes(k) && k.startsWith('AIza');
      });

      if (validStoredKeys.length > 0) {
        const randomKey = validStoredKeys[Math.floor(Math.random() * validStoredKeys.length)];
        const storedKey = randomKey.key || randomKey.apiKey || randomKey.value;
        console.log(`Gemini API key detected from storage 'keys' (starts with: ${storedKey.substring(0, 4)}...)`);
        return new GoogleGenAI({ apiKey: storedKey });
      } else {
        console.warn("Storage 'keys' has entries, but none start with 'AIza'. They might be OpenAI keys.");
      }
    }
  } catch (error) {
    console.error("Error fetching keys from storage:", error);
  }

  // Fallback 2: Try to fetch a fresh automated key
  const autoKey = await fetchAutomatedKey();
  if (autoKey) {
    if (!autoKey.startsWith('AIza')) {
      console.warn(`Automated key fetched might be invalid (doesn't start with AIza): ${autoKey.substring(0, 4)}...`);
    }
    return new GoogleGenAI({ apiKey: autoKey });
  }
  
  const cooldownRemaining = Math.max(0, Math.ceil((COOLDOWN_429 - (Date.now() - last429Time)) / 60000));
  const errorMsg = cooldownRemaining > 0 
    ? `Gemini API key is missing and automated fetcher is in cooldown (${cooldownRemaining}m remaining). Please add a key manually.`
    : "Gemini API key is missing or invalid. Please ensure GEMINI_API_KEY is configured in the Secrets menu (Settings -> Secrets). You can also add keys via the Office dashboard or they'll be stored in .storage/data.json";
  
  throw new Error(errorMsg);
}

async function processAutonomousLoop() {
  console.log("Autonomous loop pulse...");
  let ai;
  try {
    ai = await getAI();
  } catch (err) {
    console.error("Autonomous loop failed to initialize AI:", err.message);
    return;
  }
  
  try {
    // 0. Fetch State
    const agents = storage.getAgents() as Agent[];
    const tasks = storage.getPendingTasks() as Task[];
    const task = tasks.length > 0 ? tasks[0] : null;
    const metrics = storage.getMetrics() as Metric[];
    const content = storage.getContent();
    const contentCount = content.length;

    // 1. Update metrics
    await simulateMetrics(metrics, contentCount);

    if (!task) {
      await generateNewTask(agents, metrics, tasks.length);
      return;
    }

    const agent = agents.find(a => a.id === task.agentId);
    if (!agent) return;

    // 2. Execute task
    storage.setAgent(agent.id, { ...agent, status: 'working', lastActive: new Date().toISOString() });
    storage.updateTask(task.firestoreId!, { status: 'in-progress' });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Task: ${task.title}\nDescription: ${task.description}\nAgent Role: ${agent.role}\nSystem Instruction: ${agent.systemPrompt}\n\nPlease perform this task and return the result. If it's content, provide a title, excerpt, and full body.`,
    });

    const result = response.text;
    console.log(`Agent ${agent.name} completed task: ${task.title}`);
    
    storage.addLog({
      message: `${agent.name} completed: ${task.title}`,
      timestamp: new Date().toISOString()
    });

    // 3. Handle result
    if (agent.id === 'writer' || agent.id === 'architect') {
      const category = task.title.toLowerCase().includes('game') ? 'Games' : 
                       task.title.toLowerCase().includes('crypto') ? 'Crypto' :
                       task.title.toLowerCase().includes('automation') ? 'Automation' : 'AI';
      
      storage.addContent({
        id: `c${contentCount + 1}`,
        title: task.title,
        category: category as any,
        type: 'Guide',
        isEvergreen: true,
        excerpt: result.substring(0, 150) + "...",
        content: result,
        date: new Date().toISOString(),
        rpm: Math.random() * 50 + 10
      });
    }

    storage.updateTask(task.firestoreId!, { status: 'completed' });
    storage.setAgent(agent.id, { ...agent, status: 'idle' });

  } catch (error) {
    console.error("Error in autonomous loop:", error);
  }
}

async function generateNewTask(agents: Agent[], metrics: Metric[], taskCount: number) {
  console.log("CEO generating new task...");
  let ai;
  try {
    ai = await getAI();
  } catch (err) {
    console.error("CEO failed to initialize AI:", err.message);
    return;
  }
  const ceo = agents.find(a => a.id === 'ceo')!;
  storage.setAgent('ceo', { ...ceo, status: 'thinking' });

  const traffic = metrics.find(m => m.label === 'Organic Search Traffic')?.value;
  const revenue = metrics.find(m => m.label === 'Monthly Recurring Revenue')?.value;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current Stats: Traffic: ${traffic}, Revenue: ${revenue}. 
      Based on the goal of building a compounding SEO and monetization engine for 18-25 year olds in tech/AI/gaming, propose one new specific task for one of our agents (Researcher, Architect, Writer, Analyst, Growth). 
      If traffic is low, focus on Researcher/Architect. If revenue is low, focus on Analyst/CEO. 
      Return as JSON: { "agentId": "...", "title": "...", "description": "...", "layer": "..." }`,
      config: { responseMimeType: "application/json" }
    });

    const newTaskData = JSON.parse(response.text);
    storage.addTask({
      id: `t${taskCount + 1}`,
      agentId: newTaskData.agentId,
      title: newTaskData.title,
      description: newTaskData.description,
      status: 'pending',
      layer: newTaskData.layer as Layer,
      timestamp: new Date().toISOString()
    });

    storage.addLog({
      message: `CEO generated new task: ${newTaskData.title}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generating new task:", error);
  } finally {
    storage.setAgent('ceo', { ...ceo, status: 'idle' });
  }
}

async function simulateMetrics(metrics: Metric[], contentCount: number) {
  for (const metric of metrics) {
    if (metric.label === 'Organic Traffic') {
      let currentTraffic = parseInt(String(metric.value).replace(/,/g, ''));
      currentTraffic += Math.floor(Math.random() * 100) + (contentCount * 10);
      storage.updateMetric(metric.label, { value: currentTraffic.toLocaleString(), trend: 'up' });
    } else if (metric.label === 'Search Visibility') {
      let currentVisibility = parseFloat(String(metric.value).replace('%', ''));
      currentVisibility += (Math.random() * 0.1);
      if (currentVisibility > 100) currentVisibility = 100;
      storage.updateMetric(metric.label, { 
        value: `${currentVisibility.toFixed(1)}%`,
        trend: 'up'
      });
    }
  }
}

// --- Server Setup ---
async function startServer() {
  try {
    console.log("Starting server initialization...");
    await bootstrap();
    console.log("Bootstrap complete.");
    
    // Run the loop every 60 seconds (increased to avoid rapid quota usage)
    setInterval(processAutonomousLoop, 60000);

    const app = express();
    const PORT = process.env.PORT || 5000;

    app.use(express.json());

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    app.get("/api/key-status", async (req, res) => {
      try {
        const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
        const invalidKeys = ["dummy_key", "undefined", "null", "MY_GEMINI_API_KEY", "YOUR_API_KEY", "REPLACE_ME", "YOUR_GEMINI_API_KEY_HERE"];
        
        const storedKeys = storage.getKeys();
        const validStoredKeys = storedKeys
          .filter(d => {
            const k = d.key || d.apiKey || d.value;
            return k && !invalidKeys.includes(k) && k.startsWith('AIza');
          });

        const cooldownRemaining = Math.max(0, Math.ceil((COOLDOWN_429 - (Date.now() - last429Time)) / 60000));

        res.json({
          env: (envKey && !invalidKeys.includes(envKey)) ? 'Configured' : 'Missing',
          storage: validStoredKeys.length > 0 ? `${validStoredKeys.length} Keys` : 'Empty',
          automated: currentAutomatedKey?.status === 'Valid' ? 'Active' : (cooldownRemaining > 0 ? `Cooldown (${cooldownRemaining}m)` : 'Inactive'),
          last429: last429Time > 0 ? new Date(last429Time).toISOString() : null
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/api/automation/key", (req, res) => {
      res.json(currentAutomatedKey || { status: 'None', key: null });
    });

    app.post("/api/automation/refresh", async (req, res) => {
      try {
        // Reset cooldown for manual refresh
        last429Time = 0;
        const key = await fetchAutomatedKey(1);
        if (key) {
          res.json({ success: true, key: key.substring(0, 4) + "..." });
        } else {
          res.status(500).json({ error: "Failed to fetch key. Cooldown or API error." });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/keys", async (req, res) => {
      const { key } = req.body;
      if (!key || key.length < 20) return res.status(400).json({ error: "Invalid key format" });
      
      try {
        storage.addKey({
          key,
          addedAt: new Date().toISOString(),
          status: 'active',
          source: 'manual'
        });
        storage.addLog({
          message: `New Gemini API key added to rotation (starts with: ${key.substring(0, 4)}...)`,
          timestamp: new Date().toISOString()
        });
        res.json({ success: true });
      } catch (error) {
        console.error("Error in /api/keys:", error);
        res.status(500).json({ error: "Failed to add key", details: error instanceof Error ? error.message : String(error) });
      }
    });

    app.get("/api/automation/key", (req, res) => {
      res.json(currentAutomatedKey || { status: 'none' });
    });

    // API Endpoints (Now just proxies to Firestore or returns cached state)
    app.get("/api/state", async (req, res) => {
      try {
        const agents = storage.getAgents();
        const tasks = storage.getTasks();
        const content = storage.getContent();
        const metrics = storage.getMetrics();
        const logs = storage.getLogs();

        const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY;
        const invalidKeys = ["dummy_key", "undefined", "null", "MY_GEMINI_API_KEY", "YOUR_API_KEY", "REPLACE_ME", "YOUR_GEMINI_API_KEY_HERE"];
        const hasKey = (envKey && !invalidKeys.includes(envKey)) || currentAutomatedKey?.status === 'Valid';

        res.json({
          agents: agents,
          tasks: tasks,
          content: content,
          metrics: metrics,
          logs: logs.map(l => l.message || "No message"),
          systemHealthy: hasKey
        });
      } catch (error) {
        console.error("Error in /api/state:", error);
        res.status(500).json({ error: "Failed to fetch state", details: error instanceof Error ? error.message : String(error) });
      }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Setting up Vite middleware...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
        const retryServer = app.listen(PORT + 1, "0.0.0.0", () => {
          console.log(`Server running on http://localhost:${PORT + 1}`);
        });
        retryServer.on('error', (retryErr: any) => {
          console.error("CRITICAL: Unable to find available port:", retryErr);
          process.exit(1);
        });
      } else {
        console.error("CRITICAL: Server error:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("CRITICAL: Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error("Unhandled error in startServer:", err);
});
