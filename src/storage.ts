import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.storage');

interface StorageData {
  agents: Record<string, any>;
  tasks: Record<string, any>;
  metrics: Record<string, any>;
  content: Record<string, any>;
  logs: Record<string, any>;
  keys: Record<string, any>;
}

const DEFAULT_DATA: StorageData = {
  agents: {},
  tasks: {},
  metrics: {},
  content: {},
  logs: {},
  keys: {}
};

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const STORAGE_FILE = path.join(STORAGE_DIR, 'data.json');

// Initialize storage file if it doesn't exist
if (!fs.existsSync(STORAGE_FILE)) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
}

function readStorage(): StorageData {
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[Storage] Error reading storage file:', error);
    return DEFAULT_DATA;
  }
}

function writeStorage(data: StorageData): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[Storage] Error writing storage file:', error);
  }
}

export const storage = {
  // Agents
  getAgents(): any[] {
    const data = readStorage();
    return Object.values(data.agents);
  },
  
  setAgent(id: string, agent: any): void {
    const data = readStorage();
    data.agents[id] = agent;
    writeStorage(data);
  },

  getAgent(id: string): any {
    const data = readStorage();
    return data.agents[id];
  },

  // Tasks
  getTasks(): any[] {
    const data = readStorage();
    return Object.values(data.tasks);
  },

  addTask(task: any): string {
    const data = readStorage();
    const id = Date.now().toString();
    data.tasks[id] = { ...task, firestoreId: id };
    writeStorage(data);
    return id;
  },

  updateTask(id: string, updates: any): void {
    const data = readStorage();
    if (data.tasks[id]) {
      data.tasks[id] = { ...data.tasks[id], ...updates };
      writeStorage(data);
    }
  },

  getPendingTasks(): any[] {
    const data = readStorage();
    return Object.values(data.tasks).filter((t: any) => t.status === 'pending').slice(0, 1);
  },

  // Metrics
  getMetrics(): any[] {
    const data = readStorage();
    return Object.values(data.metrics);
  },

  setMetric(label: string, metric: any): void {
    const data = readStorage();
    data.metrics[label] = metric;
    writeStorage(data);
  },

  updateMetric(label: string, updates: any): void {
    const data = readStorage();
    if (data.metrics[label]) {
      data.metrics[label] = { ...data.metrics[label], ...updates };
      writeStorage(data);
    }
  },

  // Content
  getContent(): any[] {
    const data = readStorage();
    return Object.values(data.content).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 50);
  },

  addContent(content: any): void {
    const data = readStorage();
    const id = Date.now().toString();
    data.content[id] = { ...content, id };
    writeStorage(data);
  },

  // Logs
  getLogs(): any[] {
    const data = readStorage();
    return Object.values(data.logs).sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 50);
  },

  addLog(log: any): void {
    const data = readStorage();
    const id = Date.now().toString();
    data.logs[id] = { ...log, id };
    writeStorage(data);
  },

  // Keys (API Keys)
  getKeys(): any[] {
    const data = readStorage();
    return Object.values(data.keys);
  },

  addKey(key: any): void {
    const data = readStorage();
    const id = Date.now().toString();
    data.keys[id] = { ...key, id };
    writeStorage(data);
  }
};

export default storage;
