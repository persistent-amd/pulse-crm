'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f6f7eb] flex items-center justify-center p-4 relative font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(233,79,55,0.06),transparent_60%)] pointer-events-none z-0" />
      
      <div className="w-full max-w-md glass-panel border border-border rounded-xl p-8 relative z-10 shadow-2xl space-y-6">
        
        {/* Header */}
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
          <h2 className="text-xl font-extrabold tracking-tight">Create your Organization</h2>
          <p className="text-xs text-muted-foreground">Provision a new sandbox shopper command center workspace.</p>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shalini Sharma"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Retail Brand Name</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Xeno Coffee Co."
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
              placeholder="e.g. name@brand.com"
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
              placeholder="••••••••"
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
                <span>Initializing Workspace Sandbox...</span>
              </>
            ) : (
              <>
                <span>Create Workspace Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Redirect toggling */}
        <div className="text-center text-[10px] text-muted-foreground pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Access Sandbox
          </Link>
        </div>

      </div>
    </div>
  );
}
