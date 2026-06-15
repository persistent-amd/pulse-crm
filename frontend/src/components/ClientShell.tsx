'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AICopilot from './AICopilot';
import GlobalSearch from './GlobalSearch';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global hotkey support for ⌘K or Ctrl+K search palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans antialiased relative">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Core Container */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        } pl-0`}
      >
        {/* Header Navigation */}
        <Navbar 
          onToggleCopilot={() => setCopilotOpen(!copilotOpen)} 
          copilotOpen={copilotOpen}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* App Main View Canvas */}
        <main className="flex-grow p-4 md:p-8 bg-zinc-950/20 relative z-0">
          {children}
        </main>
      </div>

      {/* AI Copilot Drawer */}
      <AICopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Command Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
