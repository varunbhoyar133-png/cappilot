'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ChevronRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function CounsellingPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'model',
      message: "Hello! I am your MHT CET CAP Counselling Assistant. I am automatically aware of your candidate profile. Ask me anything about engineering branch options, placements, fees, and option form planning!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem('cap_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presetQueries = [
    "Suggest best CS/IT colleges for my score",
    "How should I arrange my preference form to avoid lockouts?",
    "Compare VIT Pune vs Cummins Pune",
    "Should I pick AI & Data Science over Core Computer Engineering?"
  ];

  const parseMarkdown = (text: string) => {
    // First split by bold markers
    const boldParts = text.split(/\*\*(.*?)\*\*/g);
    return boldParts.map((boldPart, bIdx) => {
      if (bIdx % 2 === 1) {
        return <strong key={`b-${bIdx}`} className="font-extrabold text-slate-900 dark:text-white">{boldPart}</strong>;
      }
      // For non-bold parts, split by italic markers
      const italicParts = boldPart.split(/\*(.*?)\*/g);
      return italicParts.map((italicPart, iIdx) => {
        if (iIdx % 2 === 1) {
          return <em key={`i-${iIdx}`} className="italic font-medium">{italicPart}</em>;
        }
        return italicPart;
      });
    });
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;
    
    setInput('');
    setLoading(true);
    
    const userMsg = { role: 'user', message: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const res = await fetch('/api/counsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile: user
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...updatedMessages, { role: 'model', message: data.message }]);
        if (data.isFallback) {
          setIsFallbackMode(true);
        } else {
          setIsFallbackMode(false);
        }
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'model', message: "I'm having trouble connecting to the counseling database. Please check your credentials or try again." }
        ]);
      }
    } catch (e) {
      setMessages([
        ...updatedMessages,
        { role: 'model', message: "Connection lost. Please check your network connection and retry." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (query: string) => {
    handleSend(query);
  };

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-4xl mx-auto glass-panel rounded-3xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-slide-up">
      
      {/* Top Header bar */}
      <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-800 dark:text-white leading-tight">AI Counselling Assistant</h2>
              {isFallbackMode && (
                <span className="text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/25 animate-pulse">
                  Fallback Mode
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Context: {user ? `${user.percentile}%ile | ${user.category}` : 'Anonymous Candidate'}</p>
          </div>
        </div>
        
        {!user && (
          <Link href="/auth/register" className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/25 hover:bg-indigo-600 hover:text-white transition duration-200 print:hidden">
            Create Profile <ChevronRight className="h-3 w-3 inline" />
          </Link>
        )}
      </div>

      {/* Main chat log container */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4">
        {isFallbackMode && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-300 font-medium animate-slide-up">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold">Offline Fallback Mode Active</p>
              <p className="opacity-90 mt-0.5">The Google Gemini API Key is missing or invalid in the environment variables. The assistant is operating in offline mode using a rule-based expert advisor.</p>
            </div>
          </div>
        )}

        {messages.map((m, idx) => {
          const isBot = m.role === 'model' || m.role === 'assistant';
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                isBot 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/30' 
                  : 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/30'
              }`}>
                {isBot ? <Bot className="h-4.5 w-4.5" /> : <UserIcon className="h-4.5 w-4.5" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                isBot 
                  ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 text-slate-700 dark:text-slate-300' 
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
              }`}>
                {/* Simple markdown list linebreaks parser */}
                {m.message.split('\n').map((line: string, i: number) => {
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  
                  let content = line;
                  let isBullet = false;
                  let isNumbered = false;
                  
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    content = line.substring(2);
                    isBullet = true;
                  } else if (/^\d+\.\s/.test(line)) {
                    isBullet = false;
                    isNumbered = true;
                  }
                  
                  return (
                    <p key={i} className="mb-1">
                      {isBullet ? (
                        <span className="pl-2 block font-semibold">&bull; {parseMarkdown(content)}</span>
                      ) : isNumbered ? (
                        <span className="pl-2 block font-bold">{parseMarkdown(content)}</span>
                      ) : (
                        parseMarkdown(line)
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/30 shrink-0">
              <Bot className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 flex items-center gap-1">
              <span className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Preset queries & input form */}
      <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-4 shrink-0">
        
        {/* Preset query chips */}
        {messages.length === 1 && !loading && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {presetQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetClick(query)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold border border-slate-200/70 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 transition hover:border-indigo-500/40 hover:text-indigo-600 text-left"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={loading ? "AI is formulating counseling advice..." : "Ask about branch placements, cutoff margins, preference form order..."}
            disabled={loading}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
