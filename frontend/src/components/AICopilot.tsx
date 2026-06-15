'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowRight,
  TrendingUp,
  Percent,
  Play
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  charts?: 'churn' | 'campaign' | 'drop';
  actions?: { label: string; action: string; href?: string }[];
}

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AICopilot({ isOpen, onClose }: AICopilotProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I'm your Pulse Growth Strategist. Ask me about segments, campaigns, churn, or growth opportunities.",
      actions: [
        { label: "Show churn-risk shoppers", action: "churn" },
        { label: "Create a loyalty campaign", action: "loyalty" },
        { label: "Explain engagement drop", action: "drop" }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const askCopilot = async (prompt: string) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: {} }),
      });
      const data = await res.json();
      const actions = (data.actions || []).map((a: { label: string; href?: string }) => ({
        label: a.label,
        action: a.href || '',
        href: a.href,
      }));
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.answer || 'I couldn\'t generate a response. Please try again.',
        actions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'I\'m having trouble connecting right now. Try asking about churn risk, coffee buyers, or high-value shoppers.',
        actions: [
          { label: 'Go to Imports', action: '/app/imports', href: '/app/imports' },
          { label: 'Open AI Insights', action: '/app/insights', href: '/app/insights' },
        ],
      }]);
    }
    setIsTyping(false);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    askCopilot(text);
  };

  const handleActionClick = (action: string, href?: string) => {
    const path = href || action;
    if (path.startsWith('/app/')) {
      router.push(path);
      onClose();
      return;
    }
    // Treat as a prompt
    const promptMap: Record<string, string> = {
      churn: 'Show me likely churn-risk customers and what I can do about them',
      loyalty: 'Create a loyalty campaign for weekend shoppers with high engagement',
      drop: 'Explain the recent engagement drop in SMS campaigns and suggest alternatives',
    };
    const prompt = promptMap[action] || action;
    setMessages(prev => [...prev, { sender: 'user', text: prompt }]);
    askCopilot(prompt);
  };

  return (
    <aside className="fixed right-0 top-0 w-96 h-screen bg-zinc-950 glass-panel border-l border-border text-foreground z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold text-xs tracking-wider uppercase font-mono">Pulse AI Assistant</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className="space-y-3 max-w-[80%]">
              <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary/20 text-foreground border border-primary/30 rounded-tr-none'
                  : 'bg-zinc-900 border border-border rounded-tl-none'
              }`}>
                <div className="space-y-1 text-foreground/90 whitespace-pre-wrap">
                  {m.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={lIdx} className="font-bold text-primary mb-1 mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</h4>;
                    }
                    if (line.startsWith('* ')) {
                      return <li key={lIdx} className="ml-2 list-disc list-inside">{line.replace(/^\*\s/, '')}</li>;
                    }
                    return <p key={lIdx}>{line}</p>;
                  })}
                </div>
              </div>

              {/* Action chips */}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {m.actions.map((act, actIdx) => (
                    <button
                      key={actIdx}
                      onClick={() => handleActionClick(act.action, act.href)}
                      className="text-[10px] px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-border hover:border-zinc-500 transition-all text-foreground/90 font-medium flex items-center gap-1"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded bg-zinc-800 border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 bg-zinc-900 border border-border rounded-lg rounded-tl-none flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-white/[0.01]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder="Ask AI to query, segment, or draft..."
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-border text-xs focus:outline-none focus:border-primary transition-all text-foreground"
          />
          <button
            onClick={() => handleSend(inputValue)}
            className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-2.5">
          Powered by Gemini AI • Responses based on your CRM data
        </p>
      </div>
    </aside>
  );
}
