"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "gemini_online" | "offline_knowledge";
  timestamp: string;
}

const STARTER_PROMPTS = [
  "How do I dispute an inflated ICU bill?",
  "Who is eligible for Ayushman Bharat 70+?",
  "What is the IRDAI 60-minute cashless claim rule?",
  "How can I save on cardiac generic medicines?",
  "What documents are needed for claim approval?"
];

export default function HealthcareChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `### 🏥 Namaste! I am your Care India AI Navigator

I can assist you with:
- **Hospital Bill Audits & Overcharges** (NPPA price caps, ICU rates)
- **Government Schemes** (Ayushman Bharat PM-JAY, MJPJAY, CMCHIS)
- **IRDAI Insurance Rights** (60-min pre-auth, cashless denials)
- **Generic Medicines** (Jan Aushadhi equivalents & 50-85% savings)

*Click a prompt below or type your question!*`,
      source: "gemini_online",
      timestamp: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOfflineEngine, setIsOfflineEngine] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const currentTimestamp = "Just now";

    let updatedHistory: Message[] = [];
    setMessages(prev => {
      const userMsg: Message = {
        id: `msg-user-${prev.length + 1}`,
        role: "user",
        content: textToSend,
        timestamp: currentTimestamp
      };
      updatedHistory = [...prev, userMsg];
      return updatedHistory;
    });

    if (!queryText) setInput("");
    setLoading(true);

    try {
      const chatPayload = updatedHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatPayload })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      if (data.source === "offline_knowledge") {
        setIsOfflineEngine(true);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-bot-${prev.length + 1}`,
          role: "assistant",
          content: data.reply || "Sorry, I could not generate a response. Please try again.",
          source: data.source || "gemini_online",
          timestamp: "Just now"
        }
      ]);
    } catch (err: unknown) {
      console.warn("Chatbot error:", err);
      setIsOfflineEngine(true);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-bot-${prev.length + 1}`,
          role: "assistant",
          content: `I am currently operating in **Local Offline Knowledge Mode**.\n\nFor bill disputes, remember that you are legally entitled to an itemized bill before payment. Check NPPA ceiling caps for stents (max ~₹38k) and implants. You can file grievances on the National Consumer Helpline (1915).`,
          source: "offline_knowledge",
          timestamp: "Just now"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-cleared",
        role: "assistant",
        content: "Chat history cleared. How can I help you navigate your healthcare finances or patient rights today?",
        source: "gemini_online",
        timestamp: "Just now"
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-400 text-[#070C1A] rounded-full shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.6)] hover:scale-105 transition-all duration-300 group cursor-pointer border border-cyan-300/40"
          aria-label="Open Healthcare Navigator Assistant"
        >
          <div className="relative w-7 h-7 rounded-full bg-white/95 p-0.5 flex items-center justify-center shadow-inner overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping z-10"></span>
            <Image
              src="/logo.png"
              alt="Care India Logo"
              width={28}
              height={28}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex flex-col items-start pr-1">
            <span className="text-xs font-serif font-black tracking-tight leading-none">AI Medtech Navigator</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80 mt-0.5">
              Instant Rights &amp; Schemes
            </span>
          </div>
          <span className="bg-[#070C1A]/20 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ml-1">
            Online
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[85vh] bg-[#0A1022]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#070B16] border-b border-white/[0.08] px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/95 p-1 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.2)] overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Care India Logo"
                  width={36}
                  height={36}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-serif font-bold text-white leading-none">Care India Navigator</span>
                  <span className="text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                    AI MEDTECH
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOfflineEngine ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`}></span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {isOfflineEngine ? "Local Offline Knowledge Engine" : "Gemini 3.5 Lite + Offline Fallback"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors text-xs font-mono"
              >
                🧹
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 selection:bg-cyan-500/30">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {msg.role === "user" ? "You" : "Care India AI"}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">{msg.timestamp}</span>
                  {msg.source === "offline_knowledge" && (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 rounded">
                      Local Offline
                    </span>
                  )}
                </div>

                <div
                  className={`relative group max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-md ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-xs"
                      : "bg-[#111A30]/90 border border-white/[0.08] text-slate-200 rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>

                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-black/60 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10"
                    >
                      {copiedId === msg.id ? "Copied! ✓" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-[#111A30]/70 border border-white/[0.06] rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] font-mono text-slate-400 ml-1">Analyzing healthcare rules...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-[#070B16]/90 border-t border-white/[0.05] overflow-x-auto flex gap-1.5 no-scrollbar">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap shrink-0 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#070B16] border-t border-white/[0.08] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about bills, Ayushman Bharat, IRDAI, or generic drugs..."
              disabled={loading}
              className="flex-1 bg-[#0F172A] border border-white/[0.08] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-40 text-[#070C1A] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.25)] select-none"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
