'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Users, 
  Megaphone, 
  BrainCircuit, 
  Activity, 
  CheckCircle,
  Play,
  TrendingUp,
  Mail,
  Zap,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleLaunchDemo = () => {
    // Automatically set default mock user profile inside local storage
    const mockUser = {
      name: "Demo User",
      company: "Pulse Retail",
      email: "demo@pulsecrm.ai"
    };
    localStorage.setItem('pulse_user', JSON.stringify(mockUser));
    router.push('/app');
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  const features = [
    {
      icon: UploadCloud,
      title: 'Customer Imports',
      desc: 'Seamlessly ingest massive customers and orders CSV feeds with duplicate filtration and schema checks.'
    },
    {
      icon: Users,
      title: 'Audience Builder',
      desc: 'Build target cohorts using visual operators matching LTV, city, active personas, or inactivity counts.'
    },
    {
      icon: Megaphone,
      title: 'Campaign Studio',
      desc: 'Draft cross-channel templates across WhatsApp, SMS, RCS, and Email in a unified composer.'
    },
    {
      icon: BrainCircuit,
      title: 'AI Insights Showcase',
      desc: 'Audit your shopper metrics to compute growth indicators, bundle propensities, and churn alerts.'
    },
    {
      icon: Activity,
      title: 'Activity Timeline',
      desc: 'Chronological timeline of system imports, segments saved, and real-time delivery receipt callbacks.'
    }
  ];

  const aiValueProps = [
    { label: 'Detect Churn', desc: 'Predict VIP shoppers who have slowed down and trigger automated win-backs.' },
    { label: 'Recommend Campaigns', desc: 'Context-aware hooks, voucher sizing, and delivery scheduling suggestions.' },
    { label: 'Growth Opportunities', desc: 'High propensity cross-category recommendations calculated from item history.' },
    { label: 'Generate Copy', desc: 'Generate high-impact copy templates tailored by channel and tone.' }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f6f7eb] flex flex-col justify-between overflow-x-hidden font-sans relative">
      {/* Background Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(233,79,55,0.08),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-[radial-gradient(circle,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none z-0" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto h-20 px-8 flex items-center justify-between border-b border-white/[0.04] relative z-10 bg-zinc-950/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Brand Heartbeat SVG Logo */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary">
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
          <div>
            <h1 className="font-extrabold text-base tracking-tight">Pulse CRM</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/login')}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={handleLaunchDemo}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-foreground transition-all duration-150"
          >
            Launch Demo
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-16 space-y-32 relative z-10">
        
        {/* 1. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-8 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Native Marketing Command Center</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
              Pulse CRM
            </h1>
            <p className="text-xl md:text-2xl font-bold font-mono tracking-wide text-primary">
              &ldquo;A Shopper Command Center&rdquo;
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed pt-2">
              Transform raw retail CSV feeds into high-impact campaigns. Drive loyalty engagement, automate churn recovery, and track visual callbacks in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-lg bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-primary fill-primary" />
              <span>Launch Live Demo Sandbox</span>
            </button>
          </div>
        </section>

        {/* 2. Visual AI Opportunities Widget Mock */}
        <section className="glass-panel border border-border rounded-xl p-8 max-w-4xl mx-auto relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-blue-500/5 opacity-50 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-4 md:col-span-1">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block">Pulse Insights</span>
              <h3 className="text-xl font-bold tracking-tight text-foreground">AI Opportunistic Discovery</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pulse constantly scans segment parameters to flag revenue anomalies. Target the exact shoppers with personalized triggers.
              </p>
              <div className="pt-2">
                <button 
                  onClick={handleLaunchDemo}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                >
                  <span>Explore Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mock Dashboard Widget preview */}
            <div className="md:col-span-2 bg-zinc-950/80 border border-border/60 rounded-lg p-5 space-y-4 text-xs font-sans relative">
              <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Suggested Campaigns</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">94% CONFIDENCE</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded bg-zinc-900 border border-border/40">
                  <div className="flex justify-between font-bold">
                    <span>18 High-Value Shoppers Churning</span>
                    <span className="text-primary">₹66,600 Recoverable</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                    LTV exceed ₹10,000 with zero transaction logs in last 45 days. High propensity match on coffee gear items.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-muted-foreground border border-border font-mono">Channel: WhatsApp</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-muted-foreground border border-border font-mono">Voucher: 15% off</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Core Features Grid */}
        <section className="space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">Fully Featured CRM</h2>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">The Modern Marketer Toolkit</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every route is optimized for high-impact decision making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="glass-card border border-border rounded-xl p-6 hover:border-zinc-700/60 hover:-translate-y-0.5 transition-all duration-300 space-y-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-border/60 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-foreground">{feat.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. AI-Native CRM value propositions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">AI Strategy Platform</span>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Intelligent Grow-Loop</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Most platforms require manual data crunching and draft writing. Pulse CRM acts as your digital co-strategist, pointing out leakages and generating contextual copy options automatically.
              </p>
            </div>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero configuration structured prompts matching Indian retail segments.</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-channel template suggestions adjusted for casual or premium tones.</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleLaunchDemo}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/95 text-white flex items-center gap-2 shadow-lg shadow-primary/15"
              >
                <span>Launch CRM Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI props cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiValueProps.map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border bg-zinc-950/40 hover:bg-zinc-950/80 transition-all space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <h4 className="text-xs font-bold text-foreground font-mono">{item.label}</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] bg-zinc-950 py-12 px-8 text-xs text-muted-foreground relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg 
              className="w-4 h-4 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-foreground">Pulse CRM</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono pl-2 border-l border-border">
              Shopper Command Center
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px]">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Agreement</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">SaaS Terms</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Xeno Integrations</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Heartbeat API</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px]">
            <span>Powered by Xeno AI</span>
            <Heart className="w-3 h-3 text-primary fill-primary" />
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
