/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Layer = 'FRONT' | 'OFFICE' | 'BACK';

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  systemPrompt: string;
  tasks: string[];
  inputFormat: string;
  outputFormat: string;
  primaryLayer: Layer;
  status: 'idle' | 'working' | 'thinking' | 'done';
  lastActive?: string;
}

export interface Task {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  layer: Layer;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  title: string;
  category: 'Tech' | 'Games' | 'AI' | 'Automation' | 'Crypto' | 'News';
  type: 'Guide' | 'Tool' | 'Script' | 'News' | 'Review';
  isEvergreen: boolean;
  excerpt: string;
  content: string;
  date: string;
  rpm?: number;
}

export interface Metric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  category: 'Traffic' | 'Revenue' | 'SEO' | 'Quality' | 'Performance';
}

export interface AppState {
  agents: Agent[];
  tasks: Task[];
  content: ContentItem[];
  metrics: Metric[];
  logs: string[];
}
