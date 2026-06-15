'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Megaphone, BrainCircuit, Sparkles, ChevronRight } from 'lucide-react';
import { getMockCustomers, Customer } from '@/utils/mockData';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'customers' | 'campaigns' | 'insights'>('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomers(getMockCustomers());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Search filter matching
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.city.toLowerCase().includes(query.toLowerCase()) ||
    c.persona.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const mockCampaigns = [
    { name: 'Mocha Launch Promo', channel: 'WhatsApp', goal: 'Product Launch' },
    { name: 'Weekend Glow-Up Special', channel: 'WhatsApp', goal: 'Retention' },
    { name: 'Winback High-Value Shoppers', channel: 'SMS', goal: 'Retention' },
    { name: 'Summer Clearance 20%', channel: 'Email', goal: 'Upsell' }
  ];

  const filteredCampaigns = mockCampaigns.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const mockInsights = [
    { title: '214 customers inactive in 60 days', type: 'Churn Risk', redirect: '/app/insights' },
    { title: 'Weekend shoppers respond better to WhatsApp', type: 'Channel Fit', redirect: '/app/insights' },
    { title: 'High LTV beauty cross-sell opportunities', type: 'Growth Opportunity', redirect: '/app/insights' }
  ];

  const filteredInsights = mockInsights.filter(i => 
    i.title.toLowerCase().includes(query.toLowerCase())
  );

  // Default Raycast-style suggestions when query is empty
  const suggestedSearches = [
    { term: 'Churn Risk', desc: 'Query lapsed VIP cohorts' },
    { term: 'Weekend Shopper', desc: 'Identify weekend transaction peaks' },
    { term: 'High Value Loyalist', desc: 'List premium loyalty customers' },
    { term: 'Revenue Opportunities', desc: 'Review growth cross-sell briefs' }
  ];

  const handleSuggestedClick = (term: string) => {
    setQuery(term);
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="w-full max-w-xl glass-panel border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 bg-[#0d0d10]"
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-white/[0.01]">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type search queries (e.g. 'Aarav', 'WhatsApp', 'Churn')..."
            className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder-muted-foreground"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-border bg-white/[0.01] flex items-center gap-2">
          {(['all', 'customers', 'campaigns', 'insights'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={`text-[9px] px-2.5 py-1 rounded font-mono font-bold uppercase transition-all ${
                category === tab 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-transparent text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="flex-grow overflow-y-auto p-4 space-y-5">
          {query === '' ? (
            /* RAYCAST STYLE EMPTY QUERY STATE */
            <div className="space-y-5">
              
              {/* Suggested Searches */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1.5 px-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested Searches
                </h4>
                <div className="grid grid-cols-2 gap-2 p-1">
                  {suggestedSearches.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSuggestedClick(s.term)}
                      className="p-2.5 rounded-lg border border-border bg-zinc-950/40 hover:bg-white/[0.02] hover:border-zinc-500 transition-all cursor-pointer text-left"
                    >
                      <span className="text-xs font-semibold text-foreground block">{s.term}</span>
                      <span className="text-[9px] text-muted-foreground">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Customers (Default match list) */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1.5 px-2">
                  <User className="w-3.5 h-3.5" /> Recent Shoppers
                </h4>
                <div className="space-y-1">
                  {customers.slice(0, 3).map(cust => (
                    <div 
                      key={cust.id}
                      onClick={() => handleNavigation(`/app/customers/${cust.id}`)}
                      className="p-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-border transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{cust.name}</p>
                        <p className="text-[9px] text-muted-foreground">{cust.city} • LTV: ₹{cust.ltv.toLocaleString()} • Inactive {cust.lastPurchaseDaysAgo} days</p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 border border-border text-muted-foreground font-mono">
                        {cust.persona}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Campaigns (Default) */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1.5 px-2">
                  <Megaphone className="w-3.5 h-3.5" /> Recent Campaigns
                </h4>
                <div className="space-y-1">
                  {mockCampaigns.slice(0, 2).map((camp, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleNavigation('/app/campaigns')}
                      className="p-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-border transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{camp.name}</p>
                        <p className="text-[9px] text-muted-foreground">Goal: {camp.goal}</p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {camp.channel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* MATCHED QUERY RESULT STATE */
            <>
              {/* Customers Result */}
              {(category === 'all' || category === 'customers') && filteredCustomers.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1.5 px-2">
                    <User className="w-3 h-3" /> Shoppers
                  </h4>
                  {filteredCustomers.map(cust => (
                    <div 
                      key={cust.id} 
                      className="p-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-border transition-all flex items-center justify-between cursor-pointer"
                      onClick={() => handleNavigation(`/app/customers/${cust.id}`)}
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{cust.name}</p>
                        <p className="text-[9px] text-muted-foreground">{cust.city} • LTV: ₹{cust.ltv.toLocaleString()} • Orders: {cust.ordersCount}</p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 border border-border text-foreground font-mono">
                        {cust.persona}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Campaigns Result */}
              {(category === 'all' || category === 'campaigns') && filteredCampaigns.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1.5 px-2">
                    <Megaphone className="w-3 h-3" /> Campaigns
                  </h4>
                  {filteredCampaigns.map((camp, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-border transition-all flex items-center justify-between cursor-pointer"
                      onClick={() => handleNavigation('/app/campaigns')}
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">{camp.name}</p>
                        <p className="text-[9px] text-muted-foreground">Goal: {camp.goal}</p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {camp.channel}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Result */}
              {(category === 'all' || category === 'insights') && filteredInsights.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1.5 px-2">
                    <BrainCircuit className="w-3 h-3" /> AI Insights
                  </h4>
                  {filteredInsights.map((ins, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-border transition-all flex items-center justify-between cursor-pointer"
                      onClick={() => handleNavigation(ins.redirect)}
                    >
                      <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                        {ins.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {filteredCustomers.length === 0 && filteredCampaigns.length === 0 && filteredInsights.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No matches found for "{query}". Try searching other names/keywords.
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border bg-zinc-950 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>Use <kbd className="px-1 rounded bg-zinc-800 text-foreground">Esc</kbd> to exit</span>
          <span>Click to select result</span>
        </div>
      </div>
    </div>
  );
}
