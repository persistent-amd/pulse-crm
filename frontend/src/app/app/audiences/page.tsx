'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users2,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Sliders,
  Save,
  Search,
  ChevronRight,
  Download,
  Bot,
  Loader2
} from 'lucide-react';
import { getMockCustomers, Customer, CITIES, PERSONAS } from '@/utils/mockData';
import {
  downloadSampleDataset,
  getDebugCustomers,
  listAudiences,
  previewAudience,
  saveAudience,
  type DebugCustomer
} from '@/lib/api';
import { addDemoActivity, makeId, nowLabel } from '@/lib/demo-state';

interface Condition {
  id: string;
  field: 'lifetime_value' | 'total_orders' | 'persona' | 'city' | 'last_purchase_days_ago';
  op: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in' | 'between';
  value: string | number;
}

interface SavedAudience {
  id: string;
  name: string;
  description: string;
  estimated_size: number;
  source: string;
  created_at: string;
}

const ACCENT_COLOR = '#e94f37';

export default function AudiencesPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Builder conditions state
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'lifetime_value', op: 'gt', value: 5000 }
  ]);
  const [audienceName, setAudienceName] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [backendPreview, setBackendPreview] = useState<{ size: number; sample_customers: DebugCustomer[] } | null>(null);

  // AI Audience Builder state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [builderError, setBuilderError] = useState('');

  const [savedAudiences, setSavedAudiences] = useState<SavedAudience[]>([
    {
      id: 'aud-v1',
      name: 'High-Value Churn Risk',
      description: 'LTV >= ₹10,000, last purchased > 45 days ago.',
      estimated_size: 18,
      source: 'AI recommendation',
      created_at: '2026-06-14'
    },
    {
      id: 'aud-v2',
      name: 'Weekend Coffee Shoppers',
      description: 'Shoppers with Persona = Weekend Shopper & category = Coffee',
      estimated_size: 46,
      source: 'manual',
      created_at: '2026-06-12'
    },
    {
      id: 'aud-v3',
      name: 'Bengaluru Fashion Elite',
      description: 'City = Bengaluru, orders >= 3, favorite category = Fashion',
      estimated_size: 72,
      source: 'manual',
      created_at: '2026-06-10'
    }
  ]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getDebugCustomers(), listAudiences()]).then(([customerResult, audienceResult]) => {
      if (cancelled) return;
      if (customerResult.status === 'fulfilled' && customerResult.value.length > 0) {
        setCustomers(customerResult.value.map(mapDebugCustomer));
      } else {
        setCustomers(getMockCustomers());
      }
      if (audienceResult.status === 'fulfilled' && audienceResult.value.length > 0) {
        setSavedAudiences((existing) => [
          ...audienceResult.value.map((aud) => ({
            id: aud.id,
            name: aud.name,
            description: aud.description || 'Saved CRM audience',
            estimated_size: aud.estimated_size,
            source: aud.source,
            created_at: aud.created_at.substring(0, 10)
          })),
          ...existing
        ]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function mapDebugCustomer(customer: DebugCustomer, index: number): Customer {
    const ltv = Number(customer.lifetime_value || 0);
    const lastPurchaseDate = customer.last_purchase_date || new Date().toISOString().split('T')[0];
    const daysAgo = Math.max(0, Math.round((Date.now() - new Date(lastPurchaseDate).getTime()) / 86400000));
    return {
      id: customer.id,
      external_id: customer.external_id,
      name: customer.name,
      email: customer.email || `${customer.external_id.toLowerCase()}@demo.pulse`,
      phone: customer.phone || '+91 demo-imported',
      city: customer.city || CITIES[index % CITIES.length],
      persona: customer.persona as Customer['persona'],
      ltv,
      ordersCount: customer.total_orders,
      aov: customer.total_orders > 0 ? Number((ltv / customer.total_orders).toFixed(2)) : 0,
      lastPurchaseDaysAgo: daysAgo,
      lastPurchaseDate,
      favoriteCategory: 'Imported Catalog',
      recentOrders: [],
      campaignHistory: [],
      timeline: []
    };
  }

  const normalizeConditionValue = (condition: Condition) => {
    if (condition.op === 'in') {
      return String(condition.value).split(',').map((value) => value.trim()).filter(Boolean);
    }
    if (condition.op === 'between') {
      return String(condition.value).split(',').map((value) => Number(value.trim())).slice(0, 2);
    }
    if (['lifetime_value', 'total_orders', 'last_purchase_days_ago'].includes(condition.field)) {
      return Number(condition.value);
    }
    return String(condition.value);
  };

  const buildFilterPayload = () => ({
    operator: 'and',
    conditions: conditions.map((condition) => ({
      field: condition.field,
      op: condition.op,
      value: normalizeConditionValue(condition)
    }))
  });

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      previewAudience({ filter_json: buildFilterPayload(), sample_limit: 5 })
        .then((result) => {
          if (!cancelled) {
            setBackendPreview(result);
            setBuilderError('');
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setBackendPreview(null);
            const message = error instanceof Error ? error.message : '';
            if (!message.toLowerCase().includes('failed to fetch')) {
              setBuilderError('Backend rejected this filter. Use min,max for between and equals/includes for city or persona.');
            }
          }
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [conditions]);

  const evaluateConditions = (cust: Customer) => {
    return conditions.every(cond => {
      const field = cond.field;
      const op = cond.op;
      const val = cond.value;

      if (field === 'lifetime_value') {
        const numVal = Number(val);
        if (op === 'gt') return cust.ltv > numVal;
        if (op === 'gte') return cust.ltv >= numVal;
        if (op === 'lt') return cust.ltv < numVal;
        if (op === 'lte') return cust.ltv <= numVal;
        if (op === 'eq') return cust.ltv === numVal;
        if (op === 'between') {
          const [min, max] = String(val).split(',').map(Number);
          return cust.ltv >= min && cust.ltv <= max;
        }
      }
      if (field === 'total_orders') {
        const numVal = Number(val);
        if (op === 'gt') return cust.ordersCount > numVal;
        if (op === 'gte') return cust.ordersCount >= numVal;
        if (op === 'lt') return cust.ordersCount < numVal;
        if (op === 'lte') return cust.ordersCount <= numVal;
        if (op === 'eq') return cust.ordersCount === numVal;
        if (op === 'between') {
          const [min, max] = String(val).split(',').map(Number);
          return cust.ordersCount >= min && cust.ordersCount <= max;
        }
      }
      if (field === 'last_purchase_days_ago') {
        const numVal = Number(val);
        if (op === 'gt') return cust.lastPurchaseDaysAgo > numVal;
        if (op === 'gte') return cust.lastPurchaseDaysAgo >= numVal;
        if (op === 'lt') return cust.lastPurchaseDaysAgo < numVal;
        if (op === 'lte') return cust.lastPurchaseDaysAgo <= numVal;
        if (op === 'eq') return cust.lastPurchaseDaysAgo === numVal;
        if (op === 'between') {
          const [min, max] = String(val).split(',').map(Number);
          return cust.lastPurchaseDaysAgo >= min && cust.lastPurchaseDaysAgo <= max;
        }
      }
      if (field === 'city') {
        if (op === 'eq') return cust.city.toLowerCase() === String(val).toLowerCase();
        if (op === 'in') return String(val).toLowerCase().includes(cust.city.toLowerCase());
      }
      if (field === 'persona') {
        if (op === 'eq') return cust.persona.toLowerCase() === String(val).toLowerCase();
        if (op === 'in') return String(val).toLowerCase().includes(cust.persona.toLowerCase());
      }
      return true;
    });
  };

  const matchingCustomers = customers.filter(evaluateConditions);
  const previewCustomers = backendPreview?.sample_customers.map(mapDebugCustomer) || matchingCustomers;
  const matchedCount = backendPreview?.size ?? matchingCustomers.length;
  const totalCount = customers.length || 1000;
  const matchedPercentage = Math.round((matchedCount / totalCount) * 100);

  const handleAddCondition = () => {
    const defaultVal: Record<string, any> = {
      lifetime_value: 1000,
      total_orders: 1,
      persona: 'High Value Loyalist',
      city: 'Mumbai',
      last_purchase_days_ago: 30
    };
    const newField = 'lifetime_value';
    setConditions([
      ...conditions,
      {
        id: Math.random().toString(),
        field: newField,
        op: 'gt',
        value: defaultVal[newField]
      }
    ]);
  };

  const handleUpdateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        if (updates.field) {
          const field = updates.field;
          const defaultVal: Record<string, any> = {
            lifetime_value: 5000,
            total_orders: 2,
            persona: 'High Value Loyalist',
            city: 'Mumbai',
            last_purchase_days_ago: 45
          };
          merged.value = defaultVal[field];
          merged.op = (field === 'city' || field === 'persona') ? 'eq' : 'gt';
        }
        return merged;
      }
      return c;
    }));
  };

  const handleDeleteCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const handleSaveAudience = async () => {
    if (!audienceName.trim()) {
      setBuilderError('Please enter a name for the audience.');
      return;
    }
    const newAud = {
      id: `aud-${Math.floor(100 + Math.random() * 900)}`,
      name: audienceName,
      description: audienceDesc || `Segment matching custom criteria.`,
      estimated_size: matchedCount,
      source: 'manual',
      created_at: new Date().toISOString().split('T')[0]
    };
    try {
      const saved = await saveAudience({
        name: audienceName,
        description: audienceDesc || `Segment matching custom criteria.`,
        filter_json: buildFilterPayload(),
        source: 'manual'
      }) as SavedAudience;
      setSavedAudiences([{
        id: saved.id,
        name: saved.name,
        description: saved.description || newAud.description,
        estimated_size: saved.estimated_size,
        source: saved.source,
        created_at: saved.created_at.substring(0, 10)
      }, ...savedAudiences]);
    } catch {
      setSavedAudiences([newAud, ...savedAudiences]);
    }
    addDemoActivity({
      id: makeId('evt-audience'),
      type: 'audience',
      title: `Audience Cohort Saved: ${audienceName}`,
      description: `${generateLogicString()} matched ${matchedCount} shoppers. The cohort is ready for Campaign Studio.`,
      timestamp: nowLabel(),
      badge: 'Saved',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      meta: [
        { label: 'Estimated Size', value: `${matchedCount} shoppers` },
        { label: 'Source', value: 'Manual builder' }
      ]
    });
    setAudienceName('');
    setAudienceDesc('');
    setBuilderError('');
    setView('list');
  };

  const handleAiBuildAudience = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiParsing(true);
    setAiReasoning('');
    try {
      const res = await fetch('/api/ai/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.conditions && Array.isArray(data.conditions) && data.conditions.length > 0) {
        setConditions(data.conditions.map((c: { field: string; op: string; value: string | number }, i: number) => ({
          id: String(Date.now()) + i,
          field: c.field as Condition['field'],
          op: c.op as Condition['op'],
          value: c.value,
        })));
        if (data.audienceName) setAudienceName(data.audienceName);
        if (data.audienceDescription) setAudienceDesc(data.audienceDescription);
        if (data.reasoning) setAiReasoning(data.reasoning);
      }
    } catch {
      setAiReasoning('AI service temporarily unavailable. Build your audience manually below.');
    }
    setIsAiParsing(false);
  };

  const generateLogicString = () => {
    if (conditions.length === 0) return "All customers";
    return conditions.map(c => {
      const fieldLabels: Record<string, string> = {
        lifetime_value: 'Lifetime Value (LTV)',
        total_orders: 'Total Orders',
        persona: 'Persona',
        city: 'City',
        last_purchase_days_ago: 'Days since last order'
      };
      const opLabels: Record<string, string> = {
        gt: '>',
        gte: '>=',
        lt: '<',
        lte: '<=',
        eq: 'is',
        in: 'in',
        between: 'between'
      };
      const valStr = typeof c.value === 'number' ? `₹${c.value.toLocaleString()}` : c.value;
      return `[${fieldLabels[c.field]}] ${opLabels[c.op]} "${valStr}"`;
    }).join(' AND ');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <section className="flex items-center justify-between border-b border-border/30 pb-4">
        <div>
          <h2 className="title-page">Shopper Segmentation</h2>
          <p className="text-xs text-muted-foreground mt-1">Build targeted groups based on purchasing velocity, geography, and AI persona states.</p>
        </div>
        {view === 'list' ? (
          <button
            onClick={() => setView('new')}
            className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-150 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Audience</span>
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all cursor-pointer"
          >
            Cancel Builder
          </button>
        )}
      </section>

      {view === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-6">
          <div className="flex items-center gap-3 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search audiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {savedAudiences
              .filter(aud => aud.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((aud) => (
                <div
                  key={aud.id}
                  className="depth-card rounded-xl p-5 border border-border flex flex-col justify-between group cursor-pointer"
                  onClick={() => router.push(`/app/campaigns/new?audience=${aud.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 border border-border/40 text-muted-foreground uppercase font-mono font-semibold">
                        {aud.source}
                      </span>
                      <span className="text-meta">{aud.created_at}</span>
                    </div>
                    <div>
                      <h4 className="title-card group-hover:text-primary transition-colors">
                        {aud.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 min-h-[32px] leading-relaxed">
                        {aud.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Estimated Reach</span>
                      <span className="text-sm font-bold font-mono text-primary">{aud.estimated_size} shoppers</span>
                    </div>
                    <span
                      className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary border border-primary/25 text-primary group-hover:text-white transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            {savedAudiences.filter(aud => aud.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="md:col-span-3 depth-panel rounded-xl p-10 border border-border text-center space-y-3">
                <Users2 className="w-8 h-8 text-border mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-foreground">No saved audiences yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Import demo data, then create a segment from LTV, orders, city, persona, or last purchase.</p>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setView('new')}
                    className="px-3 py-2 rounded bg-primary text-white text-xs font-semibold"
                  >
                    Create Audience
                  </button>
                  <button
                    onClick={() => downloadSampleDataset('customers')}
                    className="px-3 py-2 rounded bg-zinc-900 border border-border text-foreground text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span>Sample CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CREATOR/BUILDER VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            {/* AI Audience Assistant */}
            <div className="depth-panel rounded-xl p-5 border border-primary/20 bg-gradient-to-r from-primary/[0.03] to-transparent space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-primary/10 text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">AI Audience Assistant</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono font-semibold">Beta</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Describe your target audience in plain English. AI will generate the filter rules for you.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiBuildAudience()}
                  placeholder="e.g. Customers who spent over ₹10,000 and have not purchased in 45 days"
                  className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={handleAiBuildAudience}
                  disabled={isAiParsing || !aiPrompt.trim()}
                  className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/15 cursor-pointer whitespace-nowrap"
                >
                  {isAiParsing ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Build with AI</>
                  )}
                </button>
              </div>
              {aiReasoning && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-border/50 text-[11px] text-muted-foreground leading-relaxed font-mono">
                  <span className="text-primary font-semibold">AI:</span> {aiReasoning}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'High spenders inactive 45+ days',
                  'Loyal customers with 5+ orders',
                  'Delhi shoppers',
                  'Churn risk customers',
                ].map(example => (
                  <button
                    key={example}
                    onClick={() => { setAiPrompt(example); }}
                    className="text-[9px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-border hover:border-zinc-600 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="depth-panel rounded-xl p-6 border border-border space-y-6">

              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" /> Visual Rules Engine
                </span>
                <span className="text-meta">Operator: AND</span>
              </div>

              {/* Conditions list */}
              <div className="space-y-4">
                {conditions.map((cond, idx) => (
                  <div key={cond.id} className="flex flex-wrap items-center gap-3 p-3.5 rounded-lg bg-zinc-950/40 border border-border/60">
                    <span className="text-meta w-4">#{idx + 1}</span>

                    <select
                      value={cond.field}
                      onChange={(e) => handleUpdateCondition(cond.id, { field: e.target.value as any })}
                      className="px-2.5 py-1.5 rounded bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                    >
                      <option value="lifetime_value">LTV (Lifetime Value)</option>
                      <option value="total_orders">Orders Count</option>
                      <option value="persona">AI Persona</option>
                      <option value="city">Shopper City</option>
                      <option value="last_purchase_days_ago">Days Since Last Purchase</option>
                    </select>

                    {(cond.field === 'city' || cond.field === 'persona') ? (
                      <select
                        value={cond.op}
                        onChange={(e) => handleUpdateCondition(cond.id, { op: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                      >
                        <option value="eq">Equals</option>
                        <option value="in">Includes</option>
                      </select>
                    ) : (
                      <select
                        value={cond.op}
                        onChange={(e) => handleUpdateCondition(cond.id, { op: e.target.value as any })}
                        className="px-2.5 py-1.5 rounded bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                      >
                        <option value="gt">Greater Than</option>
                        <option value="lt">Less Than</option>
                        <option value="eq">Exactly Equals</option>
                      </select>
                    )}

                    {cond.field === 'city' ? (
                      <select
                        value={cond.value}
                        onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                        className="px-2.5 py-1.5 rounded bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : cond.field === 'persona' ? (
                      <select
                        value={cond.value}
                        onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                        className="px-2.5 py-1.5 rounded bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
                      >
                        {PERSONAS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={cond.value}
                        onChange={(e) => handleUpdateCondition(cond.id, { value: Number(e.target.value) })}
                        className="px-2.5 py-1.5 w-24 rounded bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground font-mono"
                      />
                    )}

                    <button
                      onClick={() => handleDeleteCondition(cond.id)}
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all ml-auto cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddCondition}
                className="w-full py-2.5 rounded-lg border border-dashed border-border hover:border-zinc-700 hover:bg-white/[0.01] text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Filter Rule</span>
              </button>

            </div>

            {/* Generated SQL Logic Card */}
            <div className="depth-panel rounded-xl p-5 border border-border space-y-3 bg-zinc-950/40">
              <span className="text-[9px] uppercase font-mono font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 animate-pulse" /> CRM SQL Logic Translation
              </span>
              <div className="p-3 rounded bg-zinc-950 border border-border/40 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap select-all">
                {`SELECT DISTINCT customer_id FROM customer_metrics \nWHERE ${generateLogicString().replace(/\[/g, '').replace(/\]/g, '')};`}
              </div>
            </div>

            {/* Preview Matching Customers */}
            <div className="space-y-3">
              <span className="title-section px-1">
                Matching Customers Sample ({matchedCount})
              </span>
              <div className="depth-panel rounded-xl border border-border overflow-hidden bg-zinc-950/10">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-white/[0.01] text-muted-foreground text-[10px] uppercase font-mono tracking-wider">
                        <th className="p-3">Customer ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">City</th>
                        <th className="p-3">LTV</th>
                        <th className="p-3">Orders</th>
                        <th className="p-3 text-right">Persona</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {matchingCustomers.slice(0, 5).map((cust) => (
                        <tr key={cust.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3 font-mono text-muted-foreground">{cust.external_id}</td>
                          <td className="p-3 font-semibold text-foreground">{cust.name}</td>
                          <td className="p-3">{cust.city}</td>
                          <td className="p-3 font-mono font-bold text-foreground">₹{cust.ltv.toLocaleString()}</td>
                          <td className="p-3 font-mono">{cust.ordersCount}</td>
                          <td className="p-3 text-right">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-muted-foreground font-mono">
                              {cust.persona}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {matchedCount === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground text-xs">
                            No customers match the current filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          {/* Right reach estimates */}
          <div className="space-y-6">
            <div className="depth-panel rounded-xl p-5 border border-border space-y-6 flex flex-col justify-between">

              <div className="space-y-1">
                <h4 className="title-card">Reach Estimate</h4>
                <p className="text-[10px] text-muted-foreground leading-normal">Campaign delivery projection</p>
              </div>

              {/* Dial visual */}
              <div className="relative w-40 h-40 mx-auto flex flex-col items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    stroke="#1e1e24"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    stroke={ACCENT_COLOR}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={408}
                    strokeDashoffset={408 - (408 * matchedPercentage) / 100}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-foreground">{matchedPercentage}%</span>
                  <span className="text-meta uppercase">Matched</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-border/30 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Audience Size:</span>
                  <span className="font-bold font-mono text-foreground">{matchedCount} / {totalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Conversion Lift:</span>
                  <span className="font-bold font-mono text-emerald-400">+3.8% projected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Campaign Cost:</span>
                  <span className="font-bold font-mono text-foreground">₹{Math.round(matchedCount * 0.45)} (WhatsApp)</span>
                </div>
              </div>

            </div>

            {/* Save Segment */}
            <div className="depth-panel rounded-xl p-5 border border-border space-y-4">
              <h4 className="title-card border-b border-border/30 pb-2">
                Save Segment
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-meta uppercase font-semibold">Audience Name</label>
                  <input
                    type="text"
                    value={audienceName}
                    onChange={(e) => setAudienceName(e.target.value)}
                    placeholder="e.g. Mumbai High LTV Loyalists"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-meta uppercase font-semibold">Description</label>
                  <textarea
                    value={audienceDesc}
                    onChange={(e) => setAudienceDesc(e.target.value)}
                    placeholder="Brief description of segment..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAudience}
                disabled={matchedCount === 0}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/15 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Segment</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
