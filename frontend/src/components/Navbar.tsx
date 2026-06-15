'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  MessageSquareShare, 
  Sparkles, 
  ChevronDown,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Menu,
  User,
  Building,
  Settings,
  Sun,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onToggleCopilot: () => void;
  copilotOpen: boolean;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
}

export default function Navbar({ 
  onToggleCopilot, 
  copilotOpen, 
  onOpenSearch, 
  onToggleMobileMenu 
}: NavbarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [currentUser, setCurrentUser] = useState({
    name: 'Demo User',
    company: 'Pulse Retail',
    email: 'demo@pulsecrm.ai'
  });

  useEffect(() => {
    const userStr = localStorage.getItem('pulse_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) {
          setCurrentUser(user);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Customer Data Imported',
      description: 'Successfully uploaded 1,000 retail customer profiles.',
      time: '10 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'High-Value Churn Alerts',
      description: '18 VIP weekend shoppers showing churn risk signals.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Campaign Complete',
      description: 'WhatsApp Mocha Campaign reached 128 conversion goal.',
      time: '3 hours ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem('pulse_user');
    window.location.href = '/login';
  };

  const getProfileInitials = () => {
    if (!currentUser.name) return 'XS';
    return currentUser.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 text-foreground sticky top-0 z-20">
      
      {/* Mobile Toggle & Brand Indicator */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-border hover:border-zinc-700 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Search Trigger */}
      <div className="flex-1 max-w-sm md:max-w-md mx-3">
        <button 
          onClick={onOpenSearch}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-border text-muted-foreground text-xs md:text-sm hover:border-zinc-700 hover:text-foreground transition-all duration-150 text-left"
        >
          <Search className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
          <span className="truncate">Search customers, campaigns, insights...</span>
          <kbd className="ml-auto hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        
        {/* AI Copilot Status Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold border transition-all duration-200 ${
            copilotOpen
              ? 'bg-primary/20 border-primary text-primary shadow-sm shadow-primary/10'
              : 'bg-zinc-900 border-border text-muted-foreground hover:text-foreground hover:border-zinc-700'
          }`}
        >
          <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
          <span className="hidden md:inline">AI Copilot</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-zinc-900 border border-border hover:border-zinc-700 transition-all text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-zinc-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-950 glass-panel border border-border rounded-lg shadow-xl overflow-hidden text-sm z-50">
              <div className="p-3 border-b border-border flex items-center justify-between bg-white/[0.02]">
                <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5 text-primary" /> Inbox Notifications
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 transition-colors ${n.read ? 'opacity-60 bg-transparent' : 'bg-primary/5 hover:bg-primary/10'}`}
                  >
                    <div className="flex gap-2.5">
                      {n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <MessageSquareShare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate text-foreground">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.description}</p>
                        <span className="text-[9px] text-muted-foreground block mt-1 font-mono">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Profile Card & Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/30 to-rose-500/20 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold font-mono">
              {getProfileInitials()}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold group-hover:text-primary transition-colors">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {currentUser.company}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-zinc-950 glass-panel border border-border rounded-lg shadow-xl overflow-hidden text-xs z-50">
              <div className="p-3 border-b border-border bg-white/[0.01]">
                <p className="font-bold text-foreground truncate">{currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentUser.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button 
                  onClick={() => { setShowProfileMenu(false); alert("Viewing profile details..."); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-white/5 text-left text-muted-foreground hover:text-foreground transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Profile Detail</span>
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); alert("Opening organization dashboard settings..."); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-white/5 text-left text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>Organization</span>
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); alert("Opening settings..."); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-white/5 text-left text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-primary" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => { setShowProfileMenu(false); alert("Theme toggle clicked: Dark Theme Active"); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-white/5 text-left text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sun className="w-3.5 h-3.5 text-primary" />
                  <span>Theme (Dark)</span>
                </button>
                <div className="h-px bg-border my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-red-500/10 text-left text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
