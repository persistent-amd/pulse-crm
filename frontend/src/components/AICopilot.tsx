'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  actions?: { label: string; action: string }[];
}

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AICopilot({ isOpen, onClose }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello, Shalini. I'm your Pulse Growth Strategist. What campaign or shopper discovery would you like to run today?",
      actions: [
        { label: "Show likely churn customers", action: "churn" },
        { label: "Create a loyalty campaign", action: "loyalty" },
        { label: "Explain recent engagement drop", action: "drop" }
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

  const triggerMockResponse = (actionKey: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let response: Message;

      if (actionKey === 'churn') {
        response = {
          sender: 'ai',
          text: `**Analysis: 18 High-Value Shoppers at Churn Risk**

I have analyzed the customer metrics and identified **18 shoppers** who:
* Have lifetime values greater than **₹10,000**
* Have not made a purchase in the last **45 days** (AOV is ₹3,700)
* Clustered category interest: **Electronics (54%)** and **Fashion (32%)**

*Suggested Action*: Draft a win-back campaign with a 15% discount on their favorite categories via WhatsApp.`,
          charts: 'churn',
          actions: [
            { label: "Create Churn Audience", action: "create_audience_churn" },
            { label: "Draft Win-Back Campaign", action: "create_campaign_churn" }
          ]
        };
      } else if (actionKey === 'loyalty') {
        response = {
          sender: 'ai',
          text: `**Strategy: Weekend Shoppers Loyalty Upgrade**

We have identified **246 Weekend Shoppers** with a high open-rate on WhatsApp (78% vs 35% on SMS).
To drive repeat orders, I recommend launching a WhatsApp loyalty campaign targeting their favorite weekend categories (Fashion, Coffee).

*Details*:
* Segment Size: **246 customers**
* Estimated conversion rate boost: **+4.2%**
* Recommended delivery: **Saturday morning at 10:00 AM**`,
          charts: 'campaign',
          actions: [
            { label: "Create Weekend Segment", action: "create_audience_weekend" },
            { label: "Open Campaign Studio", action: "open_campaign" }
          ]
        };
      } else if (actionKey === 'drop') {
        response = {
          sender: 'ai',
          text: `**Explain Drop: SMS Campaign Click-Through Rate Falloff**

Over the last 30 days, SMS click-through rates fell from **8.5% to 3.2%**, primarily in the **Fashion** category.
*Reason*: SMS carrier filters have increased delivery failures. Additionally, D2C competitors in India are shifting aggressively to WhatsApp and RCS with rich interactive visual carousels.

*Next Best Action*: Migrate future campaigns to WhatsApp or RCS. The pilot run in Coffee category showed a **72% read rate** on WhatsApp.`,
          charts: 'drop',
          actions: [
            { label: "Review Channel Performance", action: "view_analytics" }
          ]
        };
      } else {
        response = {
          sender: 'ai',
          text: `I understand your request for "${actionKey}". Let's design a custom filter condition or draft a messaging copy for this. Select one of our templates or specify a category to build!`,
          actions: [
            { label: "Open Campaign Editor", action: "open_campaign" },
            { label: "Build New Audience", action: "open_audience" }
          ]
        };
      }

      setMessages(prev => [...prev, response]);
    }, 1200);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Check if the text matches keywords
    const lower = text.toLowerCase();
    if (lower.includes('churn') || lower.includes('inactive')) {
      triggerMockResponse('churn');
    } else if (lower.includes('loyalty') || lower.includes('weekend')) {
      triggerMockResponse('loyalty');
    } else if (lower.includes('drop') || lower.includes('decrease') || lower.includes('fall')) {
      triggerMockResponse('drop');
    } else {
      triggerMockResponse(text);
    }
  };

  const handleActionClick = (actionName: string) => {
    if (actionName === 'churn' || actionName === 'loyalty' || actionName === 'drop') {
      const userTextMap: Record<string, string> = {
        churn: "Show likely churn customers",
        loyalty: "Create a loyalty campaign for weekend shoppers",
        drop: "Explain engagement drop in SMS"
      };
      setMessages(prev => [...prev, { sender: 'user', text: userTextMap[actionName] }]);
      triggerMockResponse(actionName);
    } else {
      // Trigger frontend redirects or modals
      alert(`Triggering Action: "${actionName}" - Mock workflow completed.`);
    }
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
                {/* Simple Markdown Parser Mock */}
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

                {/* Show mini custom chart icons for details */}
                {m.charts === 'churn' && (
                  <div className="mt-3 p-2.5 rounded bg-zinc-950 border border-border/50 flex items-center gap-3">
                    <div className="p-1.5 rounded bg-red-500/10 text-red-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground">High Value At Risk</p>
                      <p className="text-xs font-bold font-mono">₹66,600 Potential Loss</p>
                    </div>
                  </div>
                )}

                {m.charts === 'campaign' && (
                  <div className="mt-3 p-2.5 rounded bg-zinc-950 border border-border/50 flex items-center gap-3">
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground">Target Reach</p>
                      <p className="text-xs font-bold font-mono">246 Shoppers on WhatsApp</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message quick action chips */}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {m.actions.map((act, actIdx) => (
                    <button
                      key={actIdx}
                      onClick={() => handleActionClick(act.action)}
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

      {/* Input Box */}
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
          AI growth suggestions are based on real-time database metric audits.
        </p>
      </div>
    </aside>
  );
}
