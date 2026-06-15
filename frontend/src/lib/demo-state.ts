export type ActivityType = 'import' | 'audience' | 'campaign' | 'engagement';

export interface DemoActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeColor?: string;
  meta?: { label: string; value: string }[];
}

export interface DemoCampaign {
  id: string;
  name: string;
  audience: string;
  audienceCount: number;
  channels: ('WhatsApp' | 'SMS' | 'Email' | 'RCS')[];
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed';
  date: string;
  ctr: string;
  revenue?: number;
}

const ACTIVITY_KEY = 'pulse_demo_activity';
const CAMPAIGN_KEY = 'pulse_demo_campaigns';
const INSIGHT_REFRESH_KEY = 'pulse_demo_insight_refresh';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('pulse-demo-state'));
}

export function getDemoActivities(fallback: DemoActivity[] = []) {
  return readJson<DemoActivity[]>(ACTIVITY_KEY, fallback);
}

export function addDemoActivity(activity: DemoActivity) {
  const next = [activity, ...getDemoActivities([])].slice(0, 50);
  writeJson(ACTIVITY_KEY, next);
  localStorage.setItem(INSIGHT_REFRESH_KEY, new Date().toISOString());
}

export function getDemoCampaigns(fallback: DemoCampaign[] = []) {
  return readJson<DemoCampaign[]>(CAMPAIGN_KEY, fallback);
}

export function addDemoCampaign(campaign: DemoCampaign) {
  const existing = getDemoCampaigns([]);
  writeJson(CAMPAIGN_KEY, [campaign, ...existing].slice(0, 30));
  localStorage.setItem(INSIGHT_REFRESH_KEY, new Date().toISOString());
}

export function getInsightRefreshToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(INSIGHT_REFRESH_KEY) || '';
}

export function nowLabel() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}
