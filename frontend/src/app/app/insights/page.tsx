'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  ArrowRight,
  TrendingDown,
  Zap,
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { getMockCustomers, Customer } from '@/utils/mockData';

const ACCENT_COLOR = '#e94f37';
const CHART_COLORS = [ACCENT_COLOR, '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AIInsightsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mounted, setMounted] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({
    'act-1': false,
    'act-2': false,
    'act-3': false,
    'act-4': true
  });

  useEffect(() => {
    setMounted(true);
    setCustomers(getMockCustomers());
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-xs font-mono animate-pulse">
        Analysing customer segments...
      </div>
    );
  }

  const personaCounts = customers.reduce((acc: Record<string, number>, c) => {
    acc[c.persona] = (acc[c.persona] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(personaCounts).map(key => ({
    name: key,
    value: personaCounts[key]
  }));

  // Prioritized Group Insights structure
  const insightsGroup = {
    critical: [
      {
        id: 'ins-c1',
        title: '18 VIP Weekend Shoppers facing Churn Risks',
        metric: '₹66,600 Recoverable',
        confidence: '94%',
        impact: 'Critical Impact',
        desc: 'LTV exceeds ₹10,000 with zero transaction logs in the last 45 days. High propensity match indicates immediate retention actions via WhatsApp coupon drops.',
        path: '/app/campaigns/new?audience=high-value-churn&channel=WhatsApp'
      }
    ],
    highPriority: [
      {
        id: 'ins-h1',
        title: 'Denim & Dress Fashion catalog alignment',
        metric: '₹48,200 Projected Lift',
        confidence: '88%',
        impact: 'High ROI Fit',
        desc: 'Weekend shopping cohorts exhibit 78% read rates on WhatsApp compared to 32% on SMS. Recommend denim catalog slide decks dispatched Saturdays at 10 AM.',
        path: '/app/campaigns/new?channel=WhatsApp&audience=weekend-shoppers'
      },
      {
        id: 'ins-h2',
        title: 'Coffee Brewer Gear French Press Upsell',
        metric: '₹1,50,000 Potential',
        confidence: '82%',
        impact: 'High conversion',
        desc: 'Arabica coffee bag purchasers have a high affinity for French Press upgrades. Converting within 20 to 35 days post initial purchase increases average order value by 32%.',
        path: '/app/campaigns/new?goal=Upsell&channel=Email'
      }
    ],
    opportunities: [
      {
        id: 'ins-o1',
        title: 'Beauty Glow Serum to Hydrating Cream cross-sell',
        metric: '₹95,000 Potential',
        confidence: '74%',
        impact: 'Growth Opportunity',
        desc: 'Serum purchasers show recurring refills of Hydrating Cream. A combined beauty package offer is projected to increase average order values by 32%.',
        path: '/app/campaigns/new?goal=Upsell'
      }
    ]
  };

  const toggleAction = (id: string) => {
    setCheckedActions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <section className="border-b border-border/30 pb-4">
        <h2 className="title-page">AI Insights & Audits</h2>
        <p className="text-xs text-muted-foreground mt-1">Predictive audits analyzing customer velocities and campaign click performance.</p>
      </section>

      {/* 1. Featured Hero Insight Card */}
      <section className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-zinc-950 via-[#131316] to-zinc-950 p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative z-10">
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Core Revenue Recovery Opportunity</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Potential Revenue Leakage Resolved
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl">
              We completed database audits for coffee category and weekend shopper clusters. Targeted campaign winbacks to the high-value churn segment are projected to recover up to ₹1.8M in lapsed GMV.
            </p>
          </div>

          <div className="md:col-span-1 p-5 rounded-lg bg-zinc-950/60 border border-primary/20 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-muted-foreground font-mono uppercase font-semibold">Potential Recovery</span>
            <span className="text-2xl font-bold font-mono text-primary mt-1">₹1,82,450</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2.5">
              94% Confidence
            </span>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side (Span 2): Grouped Opportunities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CRITICAL */}
          <div className="space-y-4">
            <h4 className="title-section flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Critical Risks
            </h4>
            
            {insightsGroup.critical.map(item => (
              <div 
                key={item.id} 
                className="depth-highlight-card rounded-xl p-5 border flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <h5 className="title-card">{item.title}</h5>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                
                <div className="flex md:flex-col items-end justify-between shrink-0 text-right font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-sans block">Recovery Leak</span>
                    <span className="font-bold text-foreground">{item.metric}</span>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Confidence: {item.confidence}</span>
                  </div>
                  <button 
                    onClick={() => router.push(item.path)}
                    className="text-[10px] text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded border border-primary/25 hover:border-primary transition-all font-semibold flex items-center gap-1 mt-2 cursor-pointer shadow-sm"
                  >
                    <span>Remediate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* HIGH PRIORITY */}
          <div className="space-y-4">
            <h4 className="title-section flex items-center gap-2 text-amber-400">
              <TrendingUp className="w-4 h-4 text-amber-400" /> High Priority
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insightsGroup.highPriority.map(item => (
                <div 
                  key={item.id} 
                  className="depth-card rounded-xl p-4.5 border border-border flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 border border-border/40 text-muted-foreground uppercase font-mono font-bold">
                        {item.impact}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Conf: {item.confidence}</span>
                    </div>
                    <h5 className="title-card mt-1">{item.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between text-xs">
                    <div className="font-mono">
                      <span className="text-[9px] text-muted-foreground block font-sans">Projected lift</span>
                      <span className="font-bold text-foreground">{item.metric.replace(' Potential', '')}</span>
                    </div>
                    <button 
                      onClick={() => router.push(item.path)}
                      className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Draft Studio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OPPORTUNITIES */}
          <div className="space-y-4">
            <h4 className="title-section flex items-center gap-2 text-blue-400">
              <Award className="w-4 h-4 text-blue-400" /> Standard Opportunities
            </h4>

            {insightsGroup.opportunities.map(item => (
              <div 
                key={item.id} 
                className="depth-card rounded-xl p-4 border border-border flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-950 border border-border/40 text-muted-foreground uppercase font-mono font-semibold">
                      {item.impact}
                    </span>
                    <h5 className="title-card">{item.title}</h5>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>

                <div className="flex md:flex-col items-end justify-between text-right font-mono text-xs shrink-0">
                  <div>
                    <span className="text-[9px] text-muted-foreground font-sans block">Propensity Val</span>
                    <span className="font-bold text-foreground">{item.metric.replace(' Potential', '')}</span>
                  </div>
                  <button 
                    onClick={() => router.push(item.path)}
                    className="text-[10px] text-foreground hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 rounded border border-border hover:border-zinc-500 transition-all font-semibold flex items-center gap-1 mt-2 cursor-pointer"
                  >
                    <span>Engage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Persona Share & Checklist */}
        <div className="space-y-8">
          
          {/* Donut Persona Analysis */}
          <div className="depth-panel rounded-xl p-5 border border-border space-y-4 flex flex-col shadow-lg">
            <div>
              <h3 className="title-card flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Persona Segmentation
              </h3>
              <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Distribution computed on database audits</p>
            </div>

            <div className="h-44 w-full flex items-center justify-center relative text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#393e41', borderRadius: '8px' }}
                    itemStyle={{ color: '#f6f7eb', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] text-muted-foreground">Diagnosed</span>
                <span className="text-sm font-bold font-mono">100%</span>
              </div>
            </div>

            <div className="space-y-2 text-[10px] border-t border-border/30 pt-3">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="font-semibold text-muted-foreground truncate font-sans">{item.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{item.value} shoppers</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="depth-panel rounded-xl p-5 border border-border space-y-4 shadow-lg">
            <div>
              <h3 className="title-card flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" /> Next Best Actions
              </h3>
              <p className="text-[10px] text-muted-foreground">Actionable growth checklist pipeline</p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { id: 'act-1', text: 'Migrate Denim Fashion campaign SMS channels to WhatsApp (High CTR fit).' },
                { id: 'act-2', text: 'Launch Win-Back discount voucher WhatsApp message to 18 Churn-Risk customers.' },
                { id: 'act-3', text: 'Run French Press coffee cross-sell email targeting Arabica beans buyers.' },
                { id: 'act-4', text: 'Upload Bengaluru offline customer csv data feed.' }
              ].map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                    checkedActions[item.id] 
                      ? 'bg-zinc-950/20 border-border/40 opacity-50' 
                      : 'bg-zinc-900 border-border hover:border-zinc-700'
                  }`}
                  onClick={() => toggleAction(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={checkedActions[item.id]}
                    onChange={() => {}}
                    className="mt-0.5 text-primary border-border focus:ring-primary rounded"
                  />
                  <span className={checkedActions[item.id] ? 'line-through text-muted-foreground' : 'text-foreground/90 font-medium'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
