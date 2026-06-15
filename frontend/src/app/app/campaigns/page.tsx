'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Edit3, 
  Copy, 
  Archive, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { getDemoCampaigns, type DemoCampaign } from '@/lib/demo-state';

interface CampaignItem {
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

export default function CampaignsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Scheduled' | 'Active' | 'Completed'>('All');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const seedCampaigns: CampaignItem[] = [
    {
      id: 'camp-101',
      name: 'Mocha Launch Promo',
      audience: 'High-Value Churn Risk',
      audienceCount: 18,
      channels: ['WhatsApp', 'Email'],
      status: 'Active',
      date: '2026-06-14',
      ctr: '18.4%'
    },
    {
      id: 'camp-102',
      name: 'Weekend Glow-Up Special',
      audience: 'Weekend Shoppers',
      audienceCount: 246,
      channels: ['WhatsApp', 'RCS'],
      status: 'Completed',
      date: '2026-06-12',
      ctr: '14.2%',
      revenue: 86450
    },
    {
      id: 'camp-103',
      name: 'Winback High-Value Shoppers',
      audience: 'High-Value Churn Risk',
      audienceCount: 18,
      channels: ['SMS'],
      status: 'Scheduled',
      date: '2026-06-16',
      ctr: '--'
    },
    {
      id: 'camp-104',
      name: 'Coffee Brewer Gear Upsell',
      audience: 'All Registered Customers',
      audienceCount: 1000,
      channels: ['Email'],
      status: 'Draft',
      date: '2026-06-14',
      ctr: '--'
    }
  ];

  const loadCampaigns = useCallback(() => {
    const persisted = getDemoCampaigns([]);
    const merged = [
      ...persisted.map(c => ({
        id: c.id,
        name: c.name,
        audience: c.audience,
        audienceCount: c.audienceCount,
        channels: c.channels,
        status: c.status,
        date: c.date,
        ctr: c.ctr,
        revenue: c.revenue,
      })),
      ...seedCampaigns,
    ];
    // Deduplicate by id
    const seen = new Set<string>();
    setCampaigns(merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
  }, []);

  useEffect(() => {
    loadCampaigns();
    const onStateChange = () => loadCampaigns();
    window.addEventListener('pulse-demo-state', onStateChange);
    return () => window.removeEventListener('pulse-demo-state', onStateChange);
  }, [loadCampaigns]);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const getChannelIcon = (ch: string) => {
    if (ch === 'WhatsApp') return <span title="WhatsApp"><MessageSquare className="w-3.5 h-3.5 text-emerald-400" /></span>;
    if (ch === 'Email') return <span title="Email"><Mail className="w-3.5 h-3.5 text-blue-400" /></span>;
    if (ch === 'SMS') return <span title="SMS"><Smartphone className="w-3.5 h-3.5 text-amber-400" /></span>;
    return <span title="RCS"><Smartphone className="w-3.5 h-3.5 text-indigo-400" /></span>;
  };

  const getStatusBadge = (status: CampaignItem['status']) => {
    const styles: Record<CampaignItem['status'], string> = {
      Draft: 'bg-zinc-800 text-muted-foreground border-border/40',
      Scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Active: 'bg-primary/20 text-primary border-primary/20 animate-pulse',
      Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleAction = (id: string, action: string) => {
    setActiveDropdown(null);
    alert(`Campaign ${id}: Triggered action "${action}"`);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.audience.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h2 className="title-page">Campaign Hub</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage and audit multi-channel shopper outreach and revenue conversions.</p>
        </div>
        <button 
          onClick={() => router.push('/app/campaigns/new')}
          className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </section>

      {/* Grid of quick summary stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Outreach', count: '1 campaign', desc: 'WhatsApp + Email dispatch' },
          { label: 'Pending Schedules', count: '1 scheduled', desc: 'SMS targeting winbacks' },
          { label: 'Completed loops', count: '1 campaign', desc: 'Attributed ₹86,450' },
          { label: 'Drafts in studio', count: '1 draft', desc: 'Coffee gear upsell flow' }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-border bg-[#111114] text-xs">
            <span className="title-section">{stat.label}</span>
            <p className="text-base font-bold text-foreground font-mono mt-1">{stat.count}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* Table search & filter tabs */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Draft', 'Scheduled', 'Active', 'Completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`text-[10px] px-2.5 py-1 rounded font-mono font-bold uppercase transition-all shrink-0 ${
                statusFilter === tab 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-transparent text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>
      </section>

      {/* Campaigns Listing Table */}
      <section className="depth-panel rounded-xl border border-border overflow-hidden bg-zinc-950/10">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/[0.01] text-muted-foreground text-[10px] uppercase font-mono tracking-wider">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Audience Segment</th>
                <th className="p-4">Channels</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Click Rate (CTR)</th>
                <th className="p-4 text-right">Attributed Value</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCampaigns.map((camp) => (
                <tr 
                  key={camp.id} 
                  className="hover:bg-white/[0.01] transition-colors cursor-pointer"
                  onClick={() => router.push(`/app/campaigns/new?campaignId=${camp.id}`)}
                >
                  <td className="p-4">
                    <p className="font-bold text-foreground text-xs">{camp.name}</p>
                    <span className="text-[9px] text-muted-foreground font-mono">{camp.id}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-foreground/80">{camp.audience}</p>
                    <span className="text-meta">{camp.audienceCount} shoppers matched</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {camp.channels.map((ch, idx) => (
                        <div 
                          key={idx} 
                          className="w-6 h-6 rounded bg-zinc-900 border border-border/60 flex items-center justify-center"
                        >
                          {getChannelIcon(ch)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(camp.status)}</td>
                  <td className="p-4 font-mono text-muted-foreground">{camp.date}</td>
                  <td className="p-4 font-mono font-semibold">{camp.ctr}</td>
                  <td className="p-4 text-right font-mono font-bold text-foreground">
                    {camp.revenue ? `₹${camp.revenue.toLocaleString()}` : '--'}
                  </td>
                  <td className="p-4 text-center relative">
                    <button 
                      onClick={(e) => toggleDropdown(camp.id, e)}
                      className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4 mx-auto" />
                    </button>

                    {activeDropdown === camp.id && (
                      <div className="absolute right-4 mt-1 w-36 bg-zinc-950 glass-panel border border-border rounded-lg shadow-xl text-left text-xs z-30 p-1">
                        <button 
                          onClick={() => handleAction(camp.id, 'view')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground text-left"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Run / View</span>
                        </button>
                        <button 
                          onClick={() => handleAction(camp.id, 'edit')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground text-left"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Edit Details</span>
                        </button>
                        <button 
                          onClick={() => handleAction(camp.id, 'duplicate')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground text-left"
                        >
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Duplicate</span>
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button 
                          onClick={() => handleAction(camp.id, 'archive')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 text-left"
                        >
                          <Archive className="w-3.5 h-3.5 text-red-400" />
                          <span>Archive</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No campaigns match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
