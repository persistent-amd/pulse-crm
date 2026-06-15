'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  ChevronRight,
  DollarSign,
  ShoppingBag,
  MapPin,
  Sliders,
  Filter,
  Download,
  UploadCloud
} from 'lucide-react';
import { getMockCustomers, Customer, CITIES, PERSONAS } from '@/utils/mockData';
import { downloadSampleDataset, getDebugCustomers, type DebugCustomer } from '@/lib/api';

function mapDebugCustomer(customer: DebugCustomer, index: number): Customer {
  const ltv = Number(customer.lifetime_value || 0);
  const lastPurchaseDaysAgo = customer.total_orders > 1 ? 35 + (index % 50) : 12;
  const lastPurchaseDate = new Date();
  lastPurchaseDate.setDate(lastPurchaseDate.getDate() - lastPurchaseDaysAgo);

  return {
    id: customer.id,
    external_id: customer.external_id,
    name: customer.name,
    email: `${customer.external_id.toLowerCase()}@demo.pulse`,
    phone: '+91 demo-imported',
    city: customer.city || 'Unknown',
    persona: customer.persona as Customer['persona'],
    ltv,
    ordersCount: customer.total_orders,
    aov: customer.total_orders > 0 ? Number((ltv / customer.total_orders).toFixed(2)) : 0,
    lastPurchaseDaysAgo,
    lastPurchaseDate: lastPurchaseDate.toISOString().split('T')[0],
    favoriteCategory: 'Imported Catalog',
    recentOrders: [],
    campaignHistory: [],
    timeline: []
  };
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [personaFilter, setPersonaFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    getDebugCustomers()
      .then((rows) => {
        if (!cancelled) setCustomers(rows.map(mapDebugCustomer));
      })
      .catch(() => {
        if (!cancelled) setCustomers(getMockCustomers());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = customers.filter(cust => {
    const matchSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery);
    const matchCity = cityFilter === 'All' || cust.city === cityFilter;
    const matchPersona = personaFilter === 'All' || cust.persona === personaFilter;
    return matchSearch && matchCity && matchPersona;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <section className="border-b border-border/30 pb-4">
        <h2 className="title-page">Shopper Registry</h2>
        <p className="text-xs text-muted-foreground mt-1">Audit complete shopper metrics, lifetime value thresholds, and computed behavior personas.</p>
      </section>

      {/* Filter Controls */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-semibold">City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2 py-1 rounded bg-zinc-900 border border-border text-xs focus:outline-none text-foreground"
            >
              <option value="All">All Cities</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-semibold">Persona:</span>
            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="px-2 py-1 rounded bg-zinc-900 border border-border text-xs focus:outline-none text-foreground"
            >
              <option value="All">All Personas</option>
              {PERSONAS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

      </section>

      {/* Customer table list */}
      <section className="depth-panel rounded-xl border border-border overflow-hidden bg-zinc-950/10">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/[0.01] text-muted-foreground text-[10px] uppercase font-mono tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Location</th>
                <th className="p-4">LTV Score</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Favorite Category</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Computed Persona</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  className="hover:bg-white/[0.01] transition-colors cursor-pointer"
                  onClick={() => router.push(`/app/customers/${cust.id}`)}
                >
                  <td className="p-4">
                    <p className="font-bold text-foreground text-xs">{cust.name}</p>
                    <span className="text-meta">{cust.email} • {cust.phone}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {cust.city}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-foreground">
                    ₹{cust.ltv.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono">{cust.ordersCount}</td>
                  <td className="p-4 font-semibold text-foreground/80">{cust.favoriteCategory}</td>
                  <td className="p-4 text-muted-foreground font-mono">{cust.lastPurchaseDaysAgo} days ago</td>
                  <td className="p-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-border text-foreground font-mono font-semibold">
                      {cust.persona}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-primary hover:text-white transition-all font-semibold flex items-center justify-center gap-0.5">
                      <span>360 Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-8 h-8 text-border" />
                      <div>
                        <p className="font-semibold text-foreground text-xs">No shoppers matched the current filters.</p>
                        <p className="text-xs mt-1">Import the official customer and order samples to populate real metrics and personas.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/app/imports');
                          }}
                          className="px-3 py-2 rounded bg-primary text-white text-xs font-semibold inline-flex items-center gap-2"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Go to Imports</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSampleDataset('customers');
                          }}
                          className="px-3 py-2 rounded bg-zinc-900 border border-border text-foreground text-xs font-semibold inline-flex items-center gap-2"
                        >
                          <Download className="w-3.5 h-3.5 text-primary" />
                          <span>Sample CSV</span>
                        </button>
                      </div>
                    </div>
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
