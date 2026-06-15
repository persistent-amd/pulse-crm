'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  Megaphone,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { getMockCustomers, Customer } from '@/utils/mockData';

export default function Customer360Page() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const list = getMockCustomers();
    const found = list.find(c => c.id === params.id) || list[0]; // fallback to first
    setCustomer(found);
  }, [params.id]);

  if (!mounted || !customer) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-xs font-mono animate-pulse">
        Generating Shopper profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="flex items-center gap-3 border-b border-border/30 pb-4">
        <button 
          onClick={() => router.push('/app/customers')}
          className="p-1.5 rounded-lg bg-zinc-900 border border-border hover:border-zinc-700 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="title-page">Customer 360</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Comprehensive audit profile of shopper behavior and interaction loops.</p>
        </div>
      </section>

      {/* Grid: Left profile card (Span 1), Right tabs & history details (Span 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile & KPI stats */}
        <div className="space-y-6">
          
          {/* Profile card */}
          <div className="depth-panel rounded-xl p-5 border border-border space-y-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-3.5 border-b border-border/30 pb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/30 to-rose-500/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {customer.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="title-card">{customer.name}</h3>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-mono font-bold mt-1">
                  {customer.persona}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground/90 truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground/90">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground/90">{customer.city}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground/90">Created external: {customer.external_id}</span>
              </div>
            </div>
          </div>

          {/* Metric cards vertical grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total LTV', val: `₹${customer.ltv.toLocaleString()}`, color: 'text-primary' },
              { label: 'Orders count', val: `${customer.ordersCount}`, color: 'text-foreground' },
              { label: 'AOV Score', val: `₹${Math.round(customer.aov).toLocaleString()}`, color: 'text-foreground' },
              { label: 'Inactivity', val: `${customer.lastPurchaseDaysAgo} days`, color: customer.lastPurchaseDaysAgo > 45 ? 'text-red-400 font-bold' : 'text-foreground' }
            ].map((metric, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-[#111114]">
                <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold">{metric.label}</span>
                <p className={`text-base font-bold font-mono mt-1 ${metric.color}`}>{metric.val}</p>
              </div>
            ))}
          </div>

          {/* Opportunity Callout */}
          {customer.persona === 'Churn Risk' && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-semibold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>ACTIVE CHURN ALERT</span>
              </div>
              <p className="text-muted-foreground leading-normal">
                Shopper has crossed inactivity threshold of 45 days. Recommended retention WhatsApp drop code: <code className="text-foreground font-semibold bg-zinc-950 px-1 py-0.5 rounded font-mono">RECOVER15</code>.
              </p>
              <button 
                onClick={() => router.push(`/app/campaigns/new?audience=high-value-churn`)}
                className="w-full py-1.5 mt-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-[10px] font-bold transition-all"
              >
                Trigger Recapture campaign
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Order history and timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order history table */}
          <div className="depth-panel rounded-xl p-5 border border-border space-y-4">
            <h4 className="title-section border-b border-border/30 pb-2">
              Purchase history
            </h4>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] text-muted-foreground uppercase font-mono">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {customer.recentOrders.map((ord) => (
                    <tr key={ord.id} className="text-foreground/80 hover:text-foreground">
                      <td className="py-2.5 font-mono font-bold text-primary">{ord.external_order_id}</td>
                      <td className="py-2.5 font-mono">{ord.order_date}</td>
                      <td className="py-2.5">{ord.category}</td>
                      <td className="py-2.5 font-medium">{ord.product}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-foreground">₹{ord.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive timeline events */}
          <div className="depth-panel rounded-xl p-5 border border-border space-y-5">
            <h4 className="title-section border-b border-border/30 pb-2">
              Communication Timeline
            </h4>
            
            <div className="relative pl-6 space-y-5 text-xs">
              {/* timeline central line */}
              <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border/60" />

              {customer.timeline.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-zinc-950 border border-border flex items-center justify-center z-10">
                    {evt.type === 'purchase' ? (
                      <ShoppingBag className="w-2.5 h-2.5 text-emerald-400" />
                    ) : evt.type === 'campaign_sent' ? (
                      <Megaphone className="w-2.5 h-2.5 text-primary" />
                    ) : (
                      <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-foreground">{evt.title}</h5>
                      <span className="text-[9px] text-muted-foreground font-mono">{evt.timestamp.substring(0, 10)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
