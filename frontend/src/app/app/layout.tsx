'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientShell from '@/components/ClientShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const userStr = localStorage.getItem('pulse_user');
    if (!userStr) {
      // Redirect to login if not authorized
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-foreground font-sans">
        <div className="flex flex-col items-center gap-4">
          {/* Glowing Pulse Heartbeat Logo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-ping" />
            <svg 
              className="w-12 h-12 text-primary relative z-10" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground animate-pulse mt-2">
            Loading Sandbox Cockpit...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <ClientShell>{children}</ClientShell>;
}
