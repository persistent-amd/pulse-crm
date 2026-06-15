'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Megaphone,
  Users,
  Layers,
  Bot,
  Sparkles,
  Send,
  Smartphone,
  Mail,
  CheckCheck,
  Tag,
  RefreshCcw,
  ArrowLeft,
  Eye,
  Gift,
  Clock,
  Calendar,
  MessageSquare,
  TrendingUp,
  Check
} from 'lucide-react';
import { getMockCustomers, Customer } from '@/utils/mockData';

export default function CampaignStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);

  // URL Pre-fill helpers
  const initialAudience = searchParams.get('audience') || 'aud-high-value-churn';
  const initialGoal = searchParams.get('goal') || 'Win Back';
  const initialChannel = searchParams.get('channel') || 'WhatsApp';

  const [selectedAudience, setSelectedAudience] = useState(initialAudience);
  const [campaignGoal, setCampaignGoal] = useState<'Retention' | 'Win Back' | 'Upsell' | 'Product Launch'>(initialGoal as any);
  const [campaignName, setCampaignName] = useState('Win Back High-Value Coffee Enthusiasts');
  const [scheduleTime, setScheduleTime] = useState('2026-06-16 10:00 AM');

  // Multi-select channels
  const [selectedChannels, setSelectedChannels] = useState<Record<string, boolean>>({
    WhatsApp: initialChannel === 'WhatsApp',
    SMS: initialChannel === 'SMS',
    Email: initialChannel === 'Email',
    RCS: initialChannel === 'RCS'
  });

  const [messageTemplate, setMessageTemplate] = useState('Hey {{customer_name}}, we noticed you haven\'t ordered your favourite {{favorite_category}} beans in a while. Here is an exclusive offer: Use code RECOVER15 for 15% off your next checkout! {{recommended_product}} is waiting for you.');

  // AI Suggestions box state
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Click one of the AI Assistant actions on the right to optimize your message copy, suggest CTR hooks, or generate headlines."
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setCustomers(getMockCustomers());
  }, []);

  const audienceOptions = [
    { id: 'aud-high-value-churn', name: 'High-Value Churn Risk', count: 18, desc: 'LTV >= ₹10k, last purchase > 45 days' },
    { id: 'aud-weekend-shoppers', name: 'Weekend Shoppers', count: 246, desc: 'Clustered Saturday/Sunday purchase logs' },
    { id: 'aud-all', name: 'All Registered Customers', count: 1000, desc: 'Complete D2C seed database' }
  ];

  const currentAudience = audienceOptions.find(a => a.id === selectedAudience) || audienceOptions[0];

  const resolveTemplate = (tpl: string) => {
    return tpl
      .replace(/{{customer_name}}/g, "Aarav Mehta")
      .replace(/{{favorite_category}}/g, "Coffee")
      .replace(/{{last_purchase_date}}/g, "2026-06-09")
      .replace(/{{recommended_product}}/g, "Arabica Beans (₹899)");
  };

  const handleChannelToggle = (ch: string) => {
    setSelectedChannels(prev => ({ ...prev, [ch]: !prev[ch] }));
  };

  const handleAiAction = (actionKey: string) => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      let suggestions: string[] = [];

      const activeChannelsList = Object.keys(selectedChannels).filter(k => selectedChannels[k]);
      const preferred = activeChannelsList.length > 0 ? activeChannelsList[0] : 'WhatsApp';

      if (actionKey === 'generate') {
        if (preferred === 'WhatsApp') {
          suggestions = [
            `Hi {{customer_name}}! ☕ It's been a while since your last {{favorite_category}} order. We've reserved a fresh batch of {{recommended_product}} just for you. Use code BREWBACK for free delivery + 10% cash back this weekend! Click to redeem: xn.co/b12`,
            `Hey {{customer_name}}! 👋 We miss your weekend vibes. Upgrade your morning ritual with {{recommended_product}} and enjoy ₹200 off your next cart. Use code LTY200. Valid for 48 hours only!`
          ];
        } else if (preferred === 'Email') {
          suggestions = [
            `Subject: We saved something special for you, {{customer_name}}\n\nHi {{customer_name}},\n\nYour morning brew deserves the best. We noticed you haven't ordered your favorite {{favorite_category}} blends in a while.\n\nHere's a special treat: Use code WELCOMEBACK for 15% off our premium collection, including {{recommended_product}}.\n\n[Shop Now]`,
            `Subject: Up to ₹500 off your next {{favorite_category}} package 🎁\n\nHey {{customer_name}},\n\nWe would love to welcome you back! Enjoy exclusive member discounts on {{recommended_product}} this weekend.`
          ];
        } else {
          suggestions = [
            `Pulse Alert: Hey {{customer_name}}, we miss you! Grab 15% off {{recommended_product}} with code RECOVER15. Shop: xn.co/r15`
          ];
        }
      } else if (actionKey === 'ctr') {
        suggestions = [
          `🔥 Add a high-intent scarcity hook: "Valid for the next 24 hours only!"`,
          `💬 Add interactive WhatsApp Quick Replies: [Shop Now] | [Remind Me Later]`,
          `✨ Personalize with specific product names: Ensure you use {{recommended_product}} instead of generic text.`
        ];
      } else if (actionKey === 'incentive') {
        suggestions = [
          `🎁 Recommend a category voucher: "₹200 discount voucher valid on Beauty/Coffee purchases above ₹1,000"`,
          `🚚 Free shipping option: "Use code FREESHIP to waive all convenience fees on your next order."`
        ];
      } else if (actionKey === 'tone') {
        suggestions = [
          `🌟 Professional Premium: "Hello {{customer_name}}, as a valued client, we invite you to experience our latest {{favorite_category}} arrivals with a complimentary gift..."`,
          `🎉 Casual Energetic: "Hey {{customer_name}}! Guess what? Your favourite {{recommended_product}} is back in stock. Let's get brewing! ⚡"`
        ];
      } else if (actionKey === 'subject') {
        suggestions = [
          `💌 "Aarav, your Coffee cup is waiting... (15% discount inside)"`,
          `💌 "Upgrade your morning ritual with {{recommended_product}}"`,
          `💌 "We miss you, Aarav. Here's ₹200 off your favorite Coffee"`
        ];
      }

      setAiSuggestions(suggestions);
    }, 800);
  };

  const handleApplySuggestion = (text: string) => {
    const cleanText = text.includes('Subject: ') ? text.split('\n\n')[1] || text : text;
    setMessageTemplate(cleanText);
    if (text.includes('Subject: ')) {
      const subject = text.split('\n\n')[0].replace('Subject: ', '');
      setCampaignName(subject);
    }
  };

  const handleLaunchCampaign = () => {
    const channelsList = Object.keys(selectedChannels).filter(k => selectedChannels[k]);
    if (channelsList.length === 0) {
      alert("Please select at least one outreach channel.");
      return;
    }
    alert(`Campaign Launched! Dispatched outbound simulated event alerts to ${currentAudience.count} recipients via ${channelsList.join(', ')}.\nCallbacks will automatically stream back to the receipt API.`);
    router.push('/app/campaigns');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <section className="flex items-center justify-between border-b border-border/30 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/app/campaigns')}
            className="p-1.5 rounded-lg bg-zinc-900 border border-border hover:border-zinc-700 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="title-page">Campaign Studio</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Design hyper-personalized outreach sequences across WhatsApp, Email, SMS, and RCS.</p>
          </div>
        </div>

        <button
          onClick={handleLaunchCampaign}
          className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Launch Campaign</span>
        </button>
      </section>

      {/* Redesigned Balanced 3-Column Grid Layout */}
      <section className="grid grid-cols-1 xl:grid-cols-7 gap-6">

        {/* Column 1: Config (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="depth-panel rounded-xl p-5 border border-border space-y-5">
            <h4 className="title-section border-b border-border/30 pb-2">
              Outreach Configuration
            </h4>

            {/* Audience */}
            <div className="space-y-1.5">
              <label className="text-meta uppercase font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Target Segment
              </label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
              >
                {audienceOptions.map(aud => (
                  <option key={aud.id} value={aud.id}>{aud.name} ({aud.count})</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground leading-normal">
                {currentAudience.desc}
              </p>
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <label className="text-meta uppercase font-semibold">Campaign Goal</label>
              <select
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
              >
                <option value="Retention">Retention (Lapsed)</option>
                <option value="Win Back">Win Back (Churn)</option>
                <option value="Upsell">Upsell (Categories)</option>
                <option value="Product Launch">New Product Launch</option>
              </select>
            </div>

            {/* Schedule */}
            <div className="space-y-1.5">
              <label className="text-meta uppercase font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Dispatch Schedule
              </label>
              <input
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            {/* Channels Checklist Multi-Select */}
            <div className="space-y-2">
              <label className="text-meta uppercase font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Active Outreach Channels
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10' },
                  { id: 'Email', icon: Mail, color: 'text-blue-400 bg-blue-500/10' },
                  { id: 'SMS', icon: Smartphone, color: 'text-amber-400 bg-amber-500/10' },
                  { id: 'RCS', icon: Smartphone, color: 'text-indigo-400 bg-indigo-500/10' }
                ].map(item => {
                  const Icon = item.icon;
                  const active = selectedChannels[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleChannelToggle(item.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${active
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-zinc-900 hover:border-zinc-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded flex items-center justify-center ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold">{item.id}</span>
                      </div>

                      {/* Checkbox indicator */}
                      <div className={`w-4 py-0.5 rounded border flex items-center justify-center ${active ? 'border-primary bg-primary text-white' : 'border-border'
                        }`}>
                        {active && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Template tags */}
            <div className="space-y-2 pt-3 border-t border-border/30">
              <span className="text-meta uppercase font-semibold block">Available Tags</span>
              <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                {[
                  { tag: '{{customer_name}}', label: 'Name' },
                  { tag: '{{favorite_category}}', label: 'Category' },
                  { tag: '{{recommended_product}}', label: 'Product' },
                  { tag: '{{last_purchase_date}}', label: 'Last Purchase' }
                ].map(item => (
                  <button
                    key={item.tag}
                    onClick={() => setMessageTemplate(prev => prev + ' ' + item.tag)}
                    className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-border hover:border-zinc-500 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-2.5 h-2.5 text-primary" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Column 2: Large Editor & Channel Previews (Span 3) */}
        <div className="xl:col-span-3 space-y-6">

          {/* Main Editor Card */}
          <div className="depth-panel rounded-xl p-6 border border-border space-y-5 shadow-lg">
            <h4 className="title-section border-b border-border/30 pb-2">
              Template Composer
            </h4>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-meta uppercase font-semibold">Campaign Name / Email Subject</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Winback High-Value Coffee Enthusiasts"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-meta uppercase font-semibold">Message Body Template</label>
                <textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Write message template with dynamic tags..."
                  rows={8}
                  className="w-full px-3.5 py-3 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground resize-none font-sans leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Sample Previews for Checked channels */}
          <div className="depth-panel rounded-xl p-5 border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" /> Multi-channel Previews
              </span>
              <span className="text-meta">Recipient: Aarav Mehta</span>
            </div>

            {/* Render dynamically by checked filters */}
            <div className="space-y-5 max-h-[360px] overflow-y-auto pr-1">

              {/* WhatsApp */}
              {selectedChannels.WhatsApp && (
                <div className="space-y-2 border-b border-border/35 pb-4 last:border-0 last:pb-0">
                  <span className="text-meta text-emerald-400 font-bold uppercase tracking-widest block">WhatsApp Preview</span>
                  <div className="max-w-sm rounded-xl border border-emerald-900/40 bg-[#0e161b] overflow-hidden p-3 shadow-md shadow-emerald-950/20">
                    <div className="bg-[#1f2c34] p-2.5 rounded-lg text-xs leading-relaxed relative flex flex-col gap-1.5 shadow-sm max-w-[90%]">
                      <p className="text-[#e9edef] whitespace-pre-wrap">{resolveTemplate(messageTemplate)}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-[#8696a0] font-mono mt-0.5">
                        <span>11:42 AM</span>
                        <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              {selectedChannels.Email && (
                <div className="space-y-2 border-b border-border/35 pb-4 last:border-0 last:pb-0">
                  <span className="text-meta text-blue-400 font-bold uppercase tracking-widest block">Email Preview</span>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-sans shadow-md space-y-2.5">
                    <div className="border-b border-border/30 pb-2 space-y-1">
                      <p className="text-muted-foreground"><span className="font-semibold text-foreground">Subject:</span> {campaignName}</p>
                      <p className="text-muted-foreground"><span className="font-semibold text-foreground">To:</span> Aarav Mehta &lt;aarav.mehta1@example.com&gt;</p>
                    </div>
                    <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap bg-zinc-900/40 p-3 rounded-lg border border-border/40">
                      {resolveTemplate(messageTemplate)}
                    </div>
                  </div>
                </div>
              )}

              {/* SMS */}
              {selectedChannels.SMS && (
                <div className="space-y-2 border-b border-border/35 pb-4 last:border-0 last:pb-0">
                  <span className="text-meta text-amber-400 font-bold uppercase tracking-widest block">SMS Preview</span>
                  <div className="max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-sans shadow-md">
                    <div className="bg-zinc-900 border border-border rounded-2xl p-3 text-foreground/90 max-w-[85%] rounded-tl-none relative leading-relaxed">
                      <p className="whitespace-pre-wrap">{resolveTemplate(messageTemplate)}</p>
                      <span className="text-[8px] text-muted-foreground block text-right mt-1 font-mono">Now • SMS</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RCS */}
              {selectedChannels.RCS && (
                <div className="space-y-2 border-b border-border/35 pb-4 last:border-0 last:pb-0">
                  <span className="text-meta text-indigo-400 font-bold uppercase tracking-widest block">RCS Business Preview</span>
                  <div className="max-w-sm rounded-xl border border-blue-900/40 bg-zinc-950 p-3 shadow-md shadow-blue-950/20">
                    <div className="space-y-2 bg-[#1a233a]/30 border border-blue-950/50 p-3 rounded-2xl rounded-tl-none max-w-[90%] leading-relaxed">
                      <div className="flex items-center gap-1 text-[9px] text-blue-400 font-bold uppercase tracking-wider font-mono">
                        <Smartphone className="w-2.5 h-2.5" /> RCS Business
                      </div>
                      <p className="text-xs text-foreground/90 whitespace-pre-wrap">{resolveTemplate(messageTemplate)}</p>
                      <span className="text-[8px] text-muted-foreground block text-right font-mono">Delivered</span>
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(selectedChannels).filter(k => selectedChannels[k]).length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  Select at least one outreach channel to preview.
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Column 3: AI Assistant Panel (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="depth-panel rounded-xl p-5 border border-border space-y-5 flex flex-col h-full justify-between shadow-lg">

            <div className="space-y-4">
              <h4 className="title-section border-b border-border/30 pb-2 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary animate-pulse" /> AI Copy Assistant
              </h4>

              {/* AI action triggers */}
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  onClick={() => handleAiAction('generate')}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-border hover:border-primary text-left font-medium text-foreground hover:text-primary transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>Generate Campaign Copy</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-primary" />
                </button>
                <button
                  onClick={() => handleAiAction('ctr')}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-border hover:border-primary text-left font-medium text-foreground hover:text-primary transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>Improve Click Rate (CTR)</span>
                  <TrendingUp className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-primary" />
                </button>
                <button
                  onClick={() => handleAiAction('incentive')}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-border hover:border-primary text-left font-medium text-foreground hover:text-primary transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>Suggest Voucher Incentive</span>
                  <Gift className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-primary" />
                </button>
                <button
                  onClick={() => handleAiAction('tone')}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-border hover:border-primary text-left font-medium text-foreground hover:text-primary transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span>Rewrite Tone (Casual/VIP)</span>
                  <RefreshCcw className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-primary" />
                </button>
                {selectedChannels.Email && (
                  <button
                    onClick={() => handleAiAction('subject')}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-border hover:border-primary text-left font-medium text-foreground hover:text-primary transition-all flex items-center justify-between group animate-in slide-in-from-top duration-200 cursor-pointer"
                  >
                    <span>Suggest Subject Lines</span>
                    <Mail className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 text-primary" />
                  </button>
                )}
              </div>
            </div>

            {/* AI logs outputs */}
            <div className="space-y-3 pt-4 border-t border-border/30">
              <span className="text-meta uppercase font-semibold block">Growth Engine Suggestions</span>

              <div className="min-h-[160px] max-h-[260px] overflow-y-auto p-3.5 rounded bg-zinc-950 border border-border/50 text-[11px] leading-relaxed text-muted-foreground font-mono space-y-4">
                {isAiLoading ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-primary">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiSuggestions.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-zinc-900 border border-border/40 text-foreground relative group/item">
                        <p className="pr-12 text-[10.5px] leading-relaxed whitespace-pre-wrap">{item}</p>
                        {item.includes('{{') && (
                          <button
                            onClick={() => handleApplySuggestion(item)}
                            className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/25 text-[9px] font-semibold transition-all cursor-pointer"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}

function LoaderIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin h-4 w-4 text-primary ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
