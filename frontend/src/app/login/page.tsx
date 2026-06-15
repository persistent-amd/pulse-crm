'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@pulsecrm.ai');
  const [password, setPassword] = useState('demo123');
  const [company, setCompany] = useState('Pulse Retail');
  const [name, setName] = useState('Demo User');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        name,
        company,
        email
      };
      localStorage.setItem('pulse_user', JSON.stringify(mockUser));
      router.push('/app');
    }, 800);
  };

  const handleQuickDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        name: "Demo User",
        company: "Pulse Retail",
        email: "demo@pulsecrm.ai"
      };
      localStorage.setItem('pulse_user', JSON.stringify(mockUser));
      router.push('/app');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f6f7eb] flex items-center justify-center p-4 relative font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(233,79,55,0.06),transparent_60%)] pointer-events-none z-0" />
      
      <div className="w-full max-w-md glass-panel border border-border rounded-xl p-8 relative z-10 shadow-2xl space-y-6">
        
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary mx-auto">
            <svg 
              className="w-6 h-6 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Access Command Center</h2>
          <p className="text-xs text-muted-foreground">Sign in to manage your shopper engagement feeds.</p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Retailer Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Company / Organization</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Secret Key / Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authorizing Sandbox...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[9px] uppercase font-mono font-bold text-muted-foreground">or quick sandbox login</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Quick Demo Trigger */}
        <button
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 hover:border-white/20 text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-3.5 h-3.5 text-primary fill-primary" />
          <span>Instant Sandbox Auth (Demo User)</span>
        </button>

        {/* Redirect toggle */}
        <div className="text-center text-[10px] text-muted-foreground pt-2">
          New to Pulse CRM?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Create an Organization
          </Link>
        </div>

      </div>
    </div>
  );
}
