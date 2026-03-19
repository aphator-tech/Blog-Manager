/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Globe, 
  Terminal, 
  Users, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  Cpu, 
  Gamepad2, 
  Bot, 
  Coins,
  ChevronRight,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Activity,
  Key,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { Agent, Task, ContentItem, Metric, AppState } from './types';

export default function App() {
  const [view, setView] = useState<'FRONT' | 'OFFICE'>('FRONT');
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = async () => {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}. Body: ${text.substring(0, 100)}`);
      }
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error("Error fetching state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-emerald-500 animate-spin" size={40} />
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Initializing Autonomous Engine...</p>
        </div>
      </div>
    );
  }

  const isHealthy = state.systemHealthy;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* System Status Bar */}
      {!isHealthy && (
        <div className="fixed top-0 left-0 w-full bg-rose-500/10 border-b border-rose-500/20 py-2 px-4 z-[60] backdrop-blur-md flex items-center justify-center gap-4">
          <ShieldAlert size={14} className="text-rose-500 animate-pulse" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-rose-500 font-bold">
            Autonomous Engine Halted: Gemini API Key Missing or Invalid
          </p>
          <button 
            onClick={() => setView('OFFICE')}
            className="text-[10px] font-mono uppercase tracking-widest bg-rose-500 text-white px-3 py-1 rounded-full hover:bg-rose-400 transition-colors"
          >
            Fix in Office
          </button>
        </div>
      )}

      {/* Navigation Toggle */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 flex items-center gap-1">
        <button 
          onClick={() => setView('OFFICE')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${view === 'OFFICE' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
        >
          <LayoutDashboard size={16} />
          Office
        </button>
        <button 
          onClick={() => setView('FRONT')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${view === 'FRONT' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
        >
          <Globe size={16} />
          Public Site
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'OFFICE' ? (
          <OfficeView key="office" state={state} />
        ) : (
          <PublicView key="front" state={state} />
        )}
      </AnimatePresence>
    </div>
  );
}

function OfficeView({ state }: { state: AppState, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-24 pb-12 px-6 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 flex items-center gap-2">
            Autonomous Engine Active
            <span className="w-1 h-1 rounded-full bg-white/20" />
            Live Status
          </span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">AI Operations Center</h1>
        <p className="text-white/40 max-w-2xl text-lg">
          Real-time visualization of our autonomous AI office. Agents are collaborating, generating intelligence, and optimizing the ecosystem.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Agents & Status */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users size={20} className="text-emerald-500" />
                Active Agents
              </h2>
              <span className="text-xs font-mono text-white/40">{state.agents.length} Units Deployed</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Terminal size={20} className="text-emerald-500" />
                Task Queue
              </h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
              {state.tasks.slice().reverse().map((task, i) => (
                <div key={task.id} className={`p-4 flex items-center justify-between ${i !== state.tasks.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    {task.status === 'completed' ? <CheckCircle2 className="text-emerald-500" size={18} /> : 
                     task.status === 'in-progress' ? <RefreshCw className="text-emerald-500 animate-spin" size={18} /> :
                     <Clock className="text-amber-500" size={18} />}
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-white/40">{task.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 bg-white/10 rounded uppercase tracking-wider">{task.layer}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" />
                System Logs
              </h2>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-[10px] space-y-1 h-48 overflow-y-auto selection:bg-emerald-500/30">
              {state.logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-emerald-500/40 opacity-50 shrink-0">{i + 1}</span>
                  <span className="text-white/60">{log}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Metrics & Key Manager */}
        <div className="space-y-8">
          <KeyManager />
          
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              SEO Effectiveness & Quality
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {state.metrics.map((metric) => (
                <div key={metric.label} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{metric.category}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/10 text-white/40'}`}>
                      {metric.trend === 'up' ? '↑' : '→'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-1">{metric.label}</p>
                  <span className="text-2xl font-bold font-mono tracking-tight">{metric.value}</span>
                </div>
              ))}
              
              {/* Additional Quality Metrics */}
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest">Quality Assurance</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">98%</span>
                </div>
                <p className="text-xs text-white/60 mb-1">Content Accuracy Score</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[98%]" />
                </div>
              </div>

              <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-blue-500/60 uppercase tracking-widest">SEO Health</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">Optimal</span>
                </div>
                <p className="text-xs text-white/60 mb-1">Cluster Authority Index</p>
                <span className="text-2xl font-bold font-mono tracking-tight text-blue-400">A+</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function AgentCard({ agent }: { agent: Agent, key?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Bot size={20} className="text-white/60 group-hover:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{agent.role}</p>
            {agent.lastActive && (
              <p className="text-[9px] text-emerald-500/60 font-mono mt-0.5 uppercase tracking-tighter">
                Last Pulse: {new Date(agent.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'idle' ? 'bg-white/20' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[10px] font-mono text-white/40 uppercase">{agent.status}</span>
        </div>
      </div>
      <p className="text-xs text-white/60 line-clamp-2 mb-3 italic">"{agent.personality}"</p>
      <div className="flex flex-wrap gap-1">
        {agent.tasks.slice(0, 2).map(task => (
          <span key={task} className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">{task}</span>
        ))}
      </div>
    </div>
  );
}

function PublicView({ state }: { state: AppState, key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white text-black min-h-screen"
    >
      {/* Public Header */}
      <header className="border-b border-black/5 sticky top-0 bg-white/80 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              META.CO
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {['Tech', 'Games', 'AI', 'Automation', 'Crypto'].map(cat => (
                <a key={cat} href="#" className="text-sm font-semibold text-black/60 hover:text-black transition-colors">{cat}</a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Search size={20} />
            </button>
            <button className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all">
              Join List
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-6">
                <TrendingUp size={14} />
                TRENDING IN INDIA: AI AUTOMATION
              </div>
              <h2 className="text-7xl font-black tracking-tight leading-[0.9] mb-8">
                FAST TECH.<br />NO HYPE.<br />JUST ACTION.
              </h2>
              <p className="text-xl text-black/60 max-w-md mb-10 leading-relaxed">
                The ultimate hub for 18-25s to learn, copy, and use the latest in AI, crypto, and automation.
              </p>
              <div className="flex items-center gap-4">
                <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                  Start Learning
                  <ArrowRight size={20} />
                </button>
                <button className="border-2 border-black/10 px-8 py-4 rounded-2xl font-bold hover:bg-black/5 transition-all">
                  Browse Tools
                </button>
              </div>
            </div>
            <div className="relative aspect-square bg-zinc-100 rounded-[40px] overflow-hidden group">
              <img 
                src="https://picsum.photos/seed/tech/1000/1000" 
                alt="Hero" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10">
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Featured Guide</p>
                <h3 className="text-3xl font-bold text-white mb-4">Build a Trading Bot in 15 Minutes</h3>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> 15 min read</span>
                  <span className="flex items-center gap-1.5"><Zap size={14} /> Beginner friendly</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black tracking-tight">LATEST DROPS</h3>
              <div className="flex gap-2">
                <button className="p-2 border border-black/10 rounded-xl hover:bg-black/5 transition-all"><ChevronRight className="rotate-180" size={20} /></button>
                <button className="p-2 border border-black/10 rounded-xl hover:bg-black/5 transition-all"><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {state.content.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
              {/* Placeholder for more content */}
              <div className="bg-zinc-50 rounded-3xl p-8 flex flex-col justify-center items-center text-center border-2 border-dashed border-black/5">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-black/20" />
                </div>
                <h4 className="font-bold mb-2">More coming soon</h4>
                <p className="text-sm text-black/40">Our agents are drafting 12 new guides this week.</p>
              </div>
            </div>
          </section>

          <aside className="space-y-12">
            <section>
              <h4 className="text-sm font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Live Activity</h4>
              <div className="space-y-6">
                {state.logs.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                    <div>
                      <p className="text-xs font-bold leading-tight mb-1">{log.split('] ')[1]}</p>
                      <p className="text-[10px] text-black/40 font-mono">{log.split('] ')[0].replace('[', '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-100 p-8 rounded-[32px]">
              <h4 className="text-xl font-black mb-4">Join the Meta-List</h4>
              <p className="text-sm text-black/60 mb-6">Get the latest tools and guides delivered to your inbox. No spam, just value.</p>
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
              <button className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
                Subscribe
              </button>
            </section>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-white py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="text-3xl font-black tracking-tighter mb-6">META.CO</div>
            <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
              Empowering the next generation of builders with actionable tech intelligence. No fluff, just the tools you need to win.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              {[1,2,3].map(i => <div key={i} className="w-10 h-10 bg-white/10 rounded-full" />)}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-emerald-400">Categories</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">AI & Automation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Crypto & Web3</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gaming Tech</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tools & Scripts</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-emerald-400">Company</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ethics Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-white/5 text-center text-white/20 text-xs font-mono uppercase tracking-widest">
          © 2026 Meta-Coordinator Office. All rights reserved.
        </div>
      </footer>
    </motion.div>
  );
}

function KeyManager() {
  const [status, setStatus] = useState<any>(null);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/key-status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey) return;
    setLoading(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey })
      });
      if (res.ok) {
        setMessage('Key added successfully!');
        setNewKey('');
        fetchStatus();
      } else {
        setMessage('Failed to add key.');
      }
    } catch (e) {
      setMessage('Error adding key.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!status) return null;

  const isHealthy = status.env === 'Configured' || status.firestore !== 'Empty' || status.automated === 'Active';

  return (
    <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Key size={20} className={isHealthy ? "text-emerald-500" : "text-rose-500"} />
          API Key Status
        </h2>
        {!isHealthy && (
          <div className="flex items-center gap-1 text-rose-500 text-[10px] font-mono uppercase animate-pulse">
            <ShieldAlert size={12} />
            System Halted
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Environment (Secrets)</span>
          <span className={status.env === 'Configured' ? "text-emerald-400" : "text-white/20"}>{status.env}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Firestore Rotation</span>
          <span className={status.firestore !== 'Empty' ? "text-emerald-400" : "text-white/20"}>{status.firestore}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Automated Fetcher</span>
          <span className={status.automated === 'Active' ? "text-emerald-400" : (status.automated.includes('Cooldown') ? "text-amber-400" : "text-white/20")}>
            {status.automated}
          </span>
        </div>
      </div>

      <form onSubmit={handleAddKey} className="space-y-3">
        <div className="relative">
          <input 
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Add Gemini API Key (AIza...)"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={loading || !newKey}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} className="text-black" />}
          </button>
        </div>
        {newKey && !newKey.startsWith('AIza') && (
          <p className="text-[9px] font-mono text-rose-400 uppercase tracking-widest text-center">
            Warning: Gemini keys usually start with "AIza"
          </p>
        )}
        {message && <p className="text-[10px] font-mono text-center text-emerald-500 uppercase tracking-widest">{message}</p>}
        <p className="text-[10px] text-white/20 leading-relaxed">
          Keys added here are stored in your private Firestore 'keys' collection and will be used for autonomous operations.
        </p>
      </form>
    </section>
  );
}

function ContentCard({ item }: { item: ContentItem, key?: string }) {
  const getIcon = (cat: string) => {
    switch(cat) {
      case 'AI': return <Bot size={16} />;
      case 'Crypto': return <Coins size={16} />;
      case 'Games': return <Gamepad2 size={16} />;
      case 'Automation': return <Zap size={16} />;
      default: return <Cpu size={16} />;
    }
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[16/10] bg-zinc-100 rounded-3xl overflow-hidden mb-6">
        <img 
          src={`https://picsum.photos/seed/${item.id}/800/500`} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
          {getIcon(item.category)}
          {item.category.toUpperCase()}
        </div>
      </div>
      <h4 className="text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
      <p className="text-sm text-black/60 line-clamp-2 mb-4 leading-relaxed">{item.excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest">{item.date.split('T')[0]}</span>
        <div className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
