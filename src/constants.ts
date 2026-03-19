/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agent, ContentItem, Task, Metric } from './types';

export const AGENTS: Agent[] = [
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

export const INITIAL_TASKS: Task[] = [
  { id: 't1', agentId: 'architect', title: 'Evergreen Cluster: AI Automation', description: 'Design a 10-article cluster around "AI for Students".', status: 'in-progress', layer: 'FRONT', timestamp: '2026-03-19' },
  { id: 't2', agentId: 'analyst', title: 'Affiliate Audit', description: 'Test 3 different AI tool affiliates for conversion.', status: 'pending', layer: 'OFFICE', timestamp: '2026-03-19' },
  { id: 't3', agentId: 'writer', title: 'Content Refresh: Trading Bots', description: 'Update the "Trading Bot" guide for Q2 2026 specs.', status: 'pending', layer: 'FRONT', timestamp: '2026-03-19' }
];

export const SAMPLE_CONTENT: ContentItem[] = [
  {
    id: 'c1',
    title: 'The Ultimate Guide to AI Automation for Students (2026)',
    category: 'AI',
    type: 'Guide',
    isEvergreen: true,
    excerpt: 'How to save 20+ hours a week using ethical AI tools. No fluff, just the stack.',
    content: 'Full guide content here...',
    date: '2026-03-19',
    rpm: 45.50
  },
  {
    id: 'c2',
    title: 'Best Budget Gaming Laptops in India (Under ₹60,000)',
    category: 'Games',
    type: 'Review',
    isEvergreen: true,
    excerpt: 'Real-world benchmarks for the most popular budget rigs in 2026.',
    content: 'Full review content here...',
    date: '2026-03-18',
    rpm: 28.20
  }
];

export const SAMPLE_METRICS: Metric[] = [
  { label: 'Organic Search Traffic', value: '45,200', trend: 'up', category: 'Traffic' },
  { label: 'Monthly Recurring Revenue', value: '$2,450', trend: 'up', category: 'Revenue' },
  { label: 'Avg. RPM', value: '$32.10', trend: 'up', category: 'Revenue' },
  { label: 'AEO Visibility Score', value: '84%', trend: 'up', category: 'SEO' }
];
