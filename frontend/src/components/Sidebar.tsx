'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Users2, 
  Megaphone, 
  BrainCircuit, 
  Activity, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Users
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  className?: string;
}

export default function Sidebar({ 
  collapsed, 
  onToggleCollapse, 
  mobileOpen, 
  onCloseMobile, 
  className = '' 
}: SidebarProps) {
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState('Pulse Retail');

  useEffect(() => {
    const userStr = localStorage.getItem('pulse_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.company) {
          setCompanyName(user.company);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const navigation = [
    { name: 'Overview', href: '/app', icon: LayoutDashboard },
    { name: 'Imports', href: '/app/imports', icon: UploadCloud },
    { name: 'Customers', href: '/app/customers', icon: Users },
    { name: 'Audiences', href: '/app/audiences', icon: Users2, badge: 'Smart' },
    { name: 'Campaigns', href: '/app/campaigns', icon: Megaphone },
    { name: 'AI Insights', href: '/app/insights', icon: BrainCircuit, premium: true },
    { name: 'Activity', href: '/app/activity', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Aside Wrapper */}
      <aside 
        className={`fixed left-0 top-0 h-screen z-40 lg:z-30 transition-all duration-300 transform bg-[#0d0d10] border-r border-border text-foreground flex flex-col ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${className}`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-border flex items-center justify-between ${collapsed ? 'lg:justify-center' : ''}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Brand Heartbeat SVG Logo */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
              <svg 
                className="w-5 h-5 text-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex flex-col gap-0.5">
                <h1 className="font-extrabold text-sm tracking-tight truncate bg-gradient-to-r from-foreground to-zinc-400 bg-clip-text text-transparent">
                  Pulse CRM
                </h1>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono truncate">
                  Command Center
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === '/app' 
              ? pathname === '/app' 
              : pathname.startsWith(item.href);
              
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.name : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary pl-2.5'
                    : 'text-muted-foreground hover:bg-white/[0.02] hover:text-foreground'
                } ${collapsed ? 'lg:justify-center lg:pl-3' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`} />
                  {(!collapsed || mobileOpen) && <span className="truncate">{item.name}</span>}
                </div>
                
                {(!collapsed || mobileOpen) && (
                  <div className="flex items-center gap-1 shrink-0">
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                    {item.premium && (
                      <span className="flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle Control */}
        <div className="hidden lg:block absolute -right-3 top-16 z-50">
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-full bg-zinc-900 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-md transition-all hover:border-zinc-500 cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Workspace Branding */}
        <div className={`p-4 border-t border-border bg-white/[0.005] flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary/30 to-rose-500/15 border border-primary/25 flex items-center justify-center text-primary text-xs font-bold font-mono shrink-0">
            WS
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Workspace</p>
              <p className="text-xs font-bold truncate text-foreground/90">{companyName}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
