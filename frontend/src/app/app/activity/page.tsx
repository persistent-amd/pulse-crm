'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Users,
  Megaphone,
  MessageSquare,
  Play,
  Clock,
  Filter,
  Inbox
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'import' | 'audience' | 'campaign' | 'engagement';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeColor?: string;
  meta?: { label: string; value: string }[];
}

export default function ActivityPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'all' | 'import' | 'audience' | 'campaign' | 'engagement'>('all');

  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: 'evt-101',
      type: 'engagement',
      title: 'WhatsApp Callback Receipt: Message Read',
      description: 'Aarav Mehta read the Mocha Launch Promo campaign message via WhatsApp.',
      timestamp: '2026-06-14 07:15 AM',
      badge: 'Receipt Ingested',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      meta: [
        { label: 'Carrier Id', value: 'wh-msg-72948293' },
        { label: 'Recipient', value: '+919876543210' },
        { label: 'Event Rank', value: '40 (read)' }
      ]
    },
    {
      id: 'evt-100',
      type: 'campaign',
      title: 'Mocha Launch Promo Campaign Dispatched',
      description: 'Triggered bulk campaign dispatch to target segment: "High-Value Churn Risk" (18 recipients). Calling external channel-service Post /send API.',
      timestamp: '2026-06-14 06:00 AM',
      badge: 'Dispatched',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      meta: [
        { label: 'Campaign ID', value: 'camp-mocha-01' },
        { label: 'Channel', value: 'WhatsApp' },
        { label: 'Template Tags', value: '4 resolved' }
      ]
    },
    {
      id: 'evt-99',
      type: 'import',
      title: 'CSV Ingestion Completed: customers.csv',
      description: 'Successfully parsed and validated customer profiles dataset. Recomputed metric tables, derivation checks for persona status completed.',
      timestamp: '2026-06-14 05:45 AM',
      badge: 'Success',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      meta: [
        { label: 'Rows Parsed', value: '1,000' },
        { label: 'Deduplicated', value: '18 profiles' },
        { label: 'Job ID', value: 'job-948' }
      ]
    },
    {
      id: 'evt-98',
      type: 'audience',
      title: 'Audience Cohort Saved: High-Value Churn Risk',
      description: 'Manual condition logic applied: LTV >= ₹10,000 AND last purchase > 45 days. Group successfully mapped to 18 customer IDs.',
      timestamp: '2026-06-13 11:12 PM',
      badge: 'Saved',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      meta: [
        { label: 'Estimated Size', value: '18 Shoppers' },
        { label: 'Source', value: 'AI opportunities pre-fill' }
      ]
    },
    {
      id: 'evt-97',
      type: 'engagement',
      title: 'Email Delivery Callback: Bounced',
      description: 'Recipient kavya.verma@example.com reported mail server bounce blocks. Provider event registered.',
      timestamp: '2026-06-13 04:30 PM',
      badge: 'Delivery Failed',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
      meta: [
        { label: 'Carrier Id', value: 'em-bounce-18492' },
        { label: 'Event Rank', value: '15 (failed)' }
      ]
    }
  ]);

  const handleSimulateCallbacks = () => {
    const randomEngagements = [
      {
        title: 'WhatsApp Callback Receipt: Clicked Link',
        description: 'Vihaan Kapoor clicked code link RECOVER15 in Denim catalog drop campaign.',
        badge: 'Receipt Ingested',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        meta: [
          { label: 'Recipient', value: '+919922114433' },
          { label: 'Event Rank', value: '50 (clicked)' }
        ]
      },
      {
        title: 'WhatsApp Callback Receipt: Converted',
        description: 'Aditi Iyer completed checkout for Sneakers (₹3,499). Attributed revenue resolved to campaign: Weekend Glow-up.',
        badge: 'Purchase Attributed',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        meta: [
          { label: 'Order ID', value: 'ORD-00003' },
          { label: 'Revenue Credit', value: '₹3,499' },
          { label: 'Event Rank', value: '60 (converted)' }
        ]
      }
    ];

    const pick = randomEngagements[Math.floor(Math.random() * randomEngagements.length)];
    const newEvt: TimelineEvent = {
      id: `evt-sim-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'engagement',
      title: pick.title,
      description: pick.description,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      badge: pick.badge,
      badgeColor: pick.badgeColor,
      meta: pick.meta
    };

    setEvents(prev => [newEvt, ...prev]);
  };

  const filteredEvents = events.filter(e => filterType === 'all' || e.type === filterType);

  const getIcon = (type: TimelineEvent['type']) => {
    if (type === 'import') return <UploadCloud className="w-4 h-4 text-emerald-400" />;
    if (type === 'audience') return <Users className="w-4 h-4 text-blue-400" />;
    if (type === 'campaign') return <Megaphone className="w-4 h-4 text-primary" />;
    return <MessageSquare className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h2 className="title-page">Activity & Callback Ingestion</h2>
          <p className="text-xs text-muted-foreground mt-1">Audit chronological operational streams, segment mappings, dispatches, and event callbacks.</p>
        </div>
        <button
          onClick={handleSimulateCallbacks}
          className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Play className="w-3.5 h-3.5 text-primary fill-primary" />
          <span>Simulate Receipt Event Callback</span>
        </button>
      </section>

      {/* Filter Tabs */}
      <section className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground mr-3 shrink-0">Filter Timeline:</span>
        {[
          { key: 'all', label: 'All Operations' },
          { key: 'import', label: 'Imports' },
          { key: 'audience', label: 'Audiences' },
          { key: 'campaign', label: 'Campaigns' },
          { key: 'engagement', label: 'Engagement Events' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterType(item.key as any)}
            className={`text-[10px] px-2.5 py-1 rounded font-mono font-bold uppercase transition-all shrink-0 ${filterType === item.key
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-transparent text-muted-foreground hover:text-foreground border border-transparent'
              }`}
          >
            {item.label}
          </button>
        ))}
      </section>

      {/* Vertical Timeline */}
      <section className="relative max-w-3xl pl-8 space-y-6">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border/80" />

        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group animate-in slide-in-from-top-4 duration-300">

            <div className="absolute -left-8 top-1.5 w-8 h-8 rounded-full bg-zinc-950 border border-border flex items-center justify-center shadow-lg group-hover:border-primary transition-colors z-10">
              {getIcon(evt.type)}
            </div>

            <div className="depth-panel rounded-xl p-5 border border-border group-hover:border-zinc-700/60 transition-all space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h4 className="title-card">
                    {evt.title}
                  </h4>
                  {evt.badge && (
                    <span className={`px-2 py-0.5 rounded text-[9px] border font-semibold font-mono ${evt.badgeColor}`}>
                      {evt.badge}
                    </span>
                  )}
                </div>

                <span className="text-meta flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {evt.timestamp}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {evt.description}
              </p>

              {evt.meta && evt.meta.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/30 text-meta bg-zinc-950/20 p-2.5 rounded border border-border/40">
                  {evt.meta.map((m, idx) => (
                    <div key={idx} className="truncate">
                      <span className="text-[9px] text-muted-foreground block">{m.label}</span>
                      <span className="font-bold text-foreground">{m.value}</span>
                    </div>
                  ))}
                  <div className="truncate">
                    <span className="text-[9px] text-muted-foreground block">Event ID</span>
                    <span className="font-bold text-primary">{evt.id}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 depth-panel border border-border rounded-xl space-y-3 text-muted-foreground text-xs">
            <Inbox className="w-8 h-8 text-border mx-auto" />
            <p>No activity logs found for the selected timeline filter.</p>
          </div>
        )}

      </section>

    </div>
  );
}
