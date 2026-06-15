'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Users,
  ShoppingBag,
  IndianRupee,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight,
  Compass
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie
} from 'recharts';
import { getMockCustomers } from '@/utils/mockData';

const ACCENT_COLOR = '#e94f37';
const CHART_COLORS = [ACCENT_COLOR, '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function OverviewDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [userName, setUserName] = useState('Shalini');

  useEffect(() => {
    setMounted(true);
    setCustomers(getMockCustomers());

    // Read logged in user details
    const userStr = localStorage.getItem('pulse_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) {
          setUserName(user.name.split(' ')[0]); // Get first name
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-xs font-mono animate-pulse">
        Loading Command Center...
      </div>
    );
  }

  // Calculations
  const totalLtv = customers.reduce((sum, c) => sum + c.ltv, 0) + 1205300;
  const personaBreakdown = customers.reduce((acc: any, c) => {
    acc[c.persona] = (acc[c.persona] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(personaBreakdown).map((key) => ({
    name: key,
    value: personaBreakdown[key]
  }));

  const trendData = [
    { month: 'Jul 25', revenue: 65000 },
    { month: 'Aug 25', revenue: 78000 },
    { month: 'Sep 25', revenue: 92000 },
    { month: 'Oct 25', revenue: 110000 },
    { month: 'Nov 25', revenue: 145000 },
    { month: 'Dec 25', revenue: 198000 },
    { month: 'Jan 26', revenue: 162000 },
    { month: 'Feb 26', revenue: 185000 },
    { month: 'Mar 26', revenue: 210000 },
    { month: 'Apr 26', revenue: 245000 },
    { month: 'May 26', revenue: 280000 },
    { month: 'Jun 26', revenue: 312000 }
  ];

  const channelData = [
    { name: 'WhatsApp', revenue: 820000, rate: '72%' },
    { name: 'Email', revenue: 340000, rate: '28%' },
    { name: 'SMS', revenue: 190000, rate: '35%' },
    { name: 'RCS', revenue: 108000, rate: '45%' }
  ];

  const opportunities = [
    {
      id: 'opp-1',
      title: 'High-value Beauty Loyalists becoming inactive',
      confidence: 94,
      reasoning: 'LTV exceeds ₹10,000 with zero transaction logs in the last 45 days. High category propensity matches "Glow Serum" and "Hydrating Cream".',
      action: 'Launch VIP Hydration Secret campaign with 15% incentive via WhatsApp.',
      redirect: '/app/campaigns/new?audience=high-value-churn&channel=WhatsApp'
    },
    {
      id: 'opp-2',
      title: 'Weekend shoppers show high WhatsApp engagement',
      confidence: 88,
      reasoning: '62% of fashion orders occur Saturday/Sunday. Read rates on WhatsApp for weekend transactions hover at 78% compared to 32% on email.',
      action: 'Draft Saturday 10:00 AM WhatsApp Denim & Dress catalog drops.',
      redirect: '/app/campaigns/new?channel=WhatsApp&audience=weekend-shoppers'
    },
    {
      id: 'opp-3',
      title: 'Recovery campaign opportunity: Coffee Brewing Gear',
      confidence: 85,
      reasoning: '112 customers bought Arabica Beans last month but did not upgrade to French Press. Typical cross-sell delay is 30 days.',
      action: 'Trigger French Press cross-sell email template to Arabica buyers.',
      redirect: '/app/campaigns/new?goal=Upsell&channel=Email'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* 1. Hero / Dashboard Welcome Section */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-[#111114] p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Growth Strategist Active</span>
            </div>
            <h2 className="title-page">
              Good morning, {userName}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-xl leading-relaxed">
              We completed diagnostics across your shopper database. Pulse CRM detected 3 high-priority growth opportunities with up to 94% confidence.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => router.push('/app/insights')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all flex items-center gap-2"
            >
              <span>View AI Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => router.push('/app/campaigns/new')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Campaign Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. KPIs Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Customers', val: '1,000', sub: '+12.4% MoM', icon: Users, path: '/app/customers', glow: 'rgba(233, 79, 55, 0.04)' },
          { title: 'Total Orders', val: '5,000', sub: '+8.1% MoM', icon: ShoppingBag, path: '/app/imports', glow: 'rgba(59, 130, 246, 0.04)' },
          { title: 'Revenue (INR)', val: `₹${totalLtv.toLocaleString('en-IN')}`, sub: '+15.2% MoM', icon: IndianRupee, path: '/app/insights', glow: 'rgba(10, 185, 129, 0.04)' },
          { title: 'Active Campaigns', val: '4', sub: 'WhatsApp, SMS, Email', icon: Megaphone, path: '/app/campaigns', glow: 'rgba(139, 92, 246, 0.04)' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => router.push(kpi.path)}
              style={{ boxShadow: `0 0 25px ${kpi.glow}` }}
              className="p-5 rounded-xl border border-border bg-[#111114] flex flex-col justify-between hover:border-primary/40 hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="title-section">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground">
                  {kpi.val}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-mono font-medium">
                    {kpi.sub}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. AI Opportunity Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="title-section">AI Opportunity Feed</h3>
              <p className="text-[10px] text-muted-foreground">Prioritized recommendations based on database logs</p>
            </div>
          </div>
          <span className="text-meta px-2 py-0.5 rounded bg-zinc-900 border border-border">
            Updated hourly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="depth-card rounded-xl p-5 border border-border flex flex-col justify-between relative group overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <span className="text-[9px] font-mono text-muted-foreground">CONFIDENCE</span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {opp.confidence}%
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h4 className="title-card truncate pr-16">{opp.title}</h4>
                </div>
                <div>
                  <p className="text-[9px] text-primary font-mono font-semibold uppercase tracking-wider">Reasoning</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {opp.reasoning}
                  </p>
                </div>
                <div className="p-3 rounded bg-zinc-950/40 border border-border/40">
                  <p className="text-[9px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">Recommended Action</p>
                  <p className="text-xs text-foreground mt-0.5 font-medium leading-relaxed">
                    {opp.action}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/30 flex justify-end gap-3.5">
                <button
                  onClick={() => router.push('/app/audiences')}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Configure Filter
                </button>
                <button
                  onClick={() => router.push(opp.redirect)}
                  className="text-[10px] text-primary hover:text-white bg-primary/10 hover:bg-primary px-3 py-1.5 rounded border border-primary/20 hover:border-primary transition-all font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <span>Engage AI Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Analytics Visual Grid (Recharts) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Trend Area Chart */}
        <div className="depth-panel rounded-xl p-5 border border-border lg:col-span-2 space-y-4">
          <div>
            <h4 className="title-card">Monthly Revenue Growth</h4>
            <p className="text-[10px] text-muted-foreground">Gross merchandise value (GMV) across the last 12 months</p>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={9} />
                <YAxis stroke="#71717a" fontSize={9} tickFormatter={(tick) => `₹${tick / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#393e41', borderRadius: '8px' }}
                  labelStyle={{ color: '#9a9ea6', fontSize: '10px' }}
                  itemStyle={{ color: '#f6f7eb', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke={ACCENT_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Persona Pie Breakdown */}
        <div className="depth-panel rounded-xl p-5 border border-border space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="title-card">Shopper Segment Share</h4>
            <p className="text-[10px] text-muted-foreground">Customer distribution by behavioral AI persona</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center relative text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#393e41', borderRadius: '8px' }}
                  itemStyle={{ color: '#f6f7eb', fontSize: '11px' }}
                  formatter={(value, name) => [`${value} customers`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Diagnosed</span>
              <span className="text-base font-bold font-mono">100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border/30 pt-3">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                <span className="text-muted-foreground truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 5. Channel Revenue breakdown Bar Chart */}
      <section className="depth-panel rounded-xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="title-card">Attributed Revenue & Engagement by outreach Channel</h4>
            <p className="text-[10px] text-muted-foreground">WhatsApp leading in conversion rates and ROI attribution</p>
          </div>
          <div className="text-xs font-mono font-bold text-primary">
            Average Campaign CTR: 12.8%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="h-56 w-full text-xs md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={9} tickFormatter={(tick) => `₹${tick / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={9} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#393e41', borderRadius: '8px' }}
                  itemStyle={{ color: '#f6f7eb', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Attributed Revenue']}
                />
                <Bar dataKey="revenue" fill={ACCENT_COLOR} radius={[0, 4, 4, 0]} barSize={20}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? ACCENT_COLOR : '#393e41'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h5 className="title-section border-b border-border/30 pb-2">
              Performance Summary
            </h5>
            <div className="space-y-3">
              {channelData.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <span className="font-semibold">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">₹{c.revenue.toLocaleString()}</span>
                    <span className="text-meta block">CTR: {c.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
