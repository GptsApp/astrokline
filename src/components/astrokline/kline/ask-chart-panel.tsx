'use client';

import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Lock, MessageCircle, Sparkles, X, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';

interface Msg { role: 'user' | 'assistant'; content: string }

interface Props {
  profile: UserProfile;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  externalValidatePast?: boolean;
}

const EXAMPLES = [
  'Should I change jobs this year?',
  'When is my best time for love?',
  'What\'s blocking my financial growth?',
  'Am I compatible with Scorpio?',
];

export function AskChartPanel({
  profile, tier, onActionGate, externalOpen, onExternalClose, externalValidatePast,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const pendingValidateRef = useRef(false);

  const isPro = tier === 'PRO';
  const isLite = tier === 'LITE';
  const canUse = isPro || isLite;

  useEffect(() => {
    if (externalOpen && canUse) setIsOpen(true);
  }, [externalOpen, canUse]);

  // When externalValidatePast is triggered, open panel and queue the validate prompt
  useEffect(() => {
    if (externalValidatePast && canUse) {
      setIsOpen(true);
      pendingValidateRef.current = true;
    }
  }, [externalValidatePast, canUse]);

  // Fire the validate prompt once panel is open and pending
  useEffect(() => {
    if (isOpen && pendingValidateRef.current && messages.length === 0 && !isLoading) {
      pendingValidateRef.current = false;
      handleSend("I want to verify a past event. Explain astrological transits that prove the inevitability of major life events that I experienced.");
    }
  }, [isOpen]);

  const handleClose = () => { setIsOpen(false); onExternalClose?.(); };

  const handleSend = async (text: string) => {
    const q = text.trim();
    if (!q || isLoading || limitReached) return;

    const userMsg: Msg = { role: 'user', content: q };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      const res = await fetch('/api/astrology/ask-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          profile,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 429 || res.status === 403) {
        setLimitReached(true);
        setIsLoading(false);
        return;
      }
      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        setIsLoading(false);
        return;
      }

      const newChatId = res.headers.get('X-Chat-Id');
      if (newChatId) setChatId(newChatId);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
    setLimitReached(false);
  };

  const handleValidatePast = () => {
    handleSend("I want to verify a past event. Explain astrological transits that prove the inevitability of major life events that I experienced.");
  };

  // ── Locked state ──
  if (!canUse) {
    return (
      <button onClick={() => onActionGate('ask_chart', 'PRO')} className="group hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 border border-white/10 bg-[#0A0A14]/90 px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-[#D4AF37]/30 rounded-lg">
        <MessageCircle className="h-4 w-4 text-white/40 group-hover:text-[#D4AF37]" />
        <span className="text-xs font-bold text-white/50 group-hover:text-[#D4AF37]">Ask Your Chart</span>
        <Lock className="h-3 w-3 text-white/20" />
      </button>
    );
  }

  // ── Closed state ──
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="group hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-xl transition-all hover:bg-[#D4AF37]/20 hover:scale-105 rounded-lg">
        <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
        <span className="text-xs font-bold text-[#D4AF37]">Ask Your Chart</span>
      </button>
    );
  }

  // ── Open state ──
  return (
    <div className={cn(
      "fixed z-50 flex flex-col overflow-hidden",
      "inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[620px] sm:w-[420px] sm:rounded-xl sm:border sm:border-white/10 sm:shadow-2xl"
    )} style={{ background: '#0c0c18' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8" style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #141425 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/15">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
          </div>
          <span className="text-sm font-semibold text-white/90 tracking-tight">Ask Your Chart</span>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={handleNewChat} className="px-2.5 py-1 text-[10px] text-white/40 hover:text-[#D4AF37] font-medium uppercase tracking-wider rounded hover:bg-white/5 transition-colors">New</button>
          )}
          <button onClick={handleClose} className="p-1.5 text-white/30 hover:text-white/60 rounded hover:bg-white/5 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden astro-chat-scope">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
              <MessageCircle className="h-6 w-6 text-[#D4AF37]/60" />
            </div>
            <p className="mb-1 text-sm font-semibold text-white/70">Ask anything about your chart</p>
            <p className="mb-6 text-xs text-white/30">Powered by evolutionary astrology AI</p>
            <div className="w-full space-y-2">
              {EXAMPLES.map(q => (
                <button key={q} onClick={() => handleSend(q)} className="w-full rounded-lg border border-white/6 bg-white/[0.02] px-4 py-2.5 text-left text-xs text-white/50 hover:border-[#D4AF37]/20 hover:text-white/70 hover:bg-[#D4AF37]/5 transition-all">
                  {q}
                </button>
              ))}
              <div className="pt-2">
                <button onClick={handleValidatePast} className="w-full relative overflow-hidden rounded-lg border border-[#D4AF37]/30 border-dashed bg-[#D4AF37]/5 px-4 py-2.5 text-left text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-between group">
                  <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Validate My Past</span>
                  <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ChatContainer>
            <MessageList
              typingIndicator={isLoading && messages[messages.length - 1]?.role === 'user'
                ? <TypingIndicator content="Analyzing your chart..." />
                : undefined
              }
            >
              {messages.map((msg, i) => (
                <Message
                  key={i}
                  model={{
                    message: msg.content,
                    direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                    position: 'single',
                  }}
                >
                  {msg.role === 'assistant' && (
                    <Message.CustomContent>
                      <div className="astro-md prose prose-sm prose-invert prose-p:my-1 prose-strong:text-white/90 max-w-none text-[13px] leading-relaxed text-white/75">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </Message.CustomContent>
                  )}
                </Message>
              ))}
            </MessageList>
            <MessageInput
              placeholder="Ask your chart anything..."
              attachButton={false}
              onSend={(_innerHtml, textContent) => handleSend(textContent)}
              disabled={isLoading || limitReached}
            />
          </ChatContainer>
        )}
      </div>
    </div>
  );
}

export function InlineAskChartEntry({ tier, onActionGate, onOpenChat, onValidatePast }: { tier: string; onActionGate: (ctx?: string, tier?: string) => void; onOpenChat?: () => void; onValidatePast?: () => void }) {
  const canUse = tier === 'PRO' || tier === 'LITE';
  return (
    <div className="md:hidden w-full flex flex-col gap-2">
      <button onClick={() => canUse ? onOpenChat?.() : onActionGate('ask_chart', 'PRO')} className={cn("w-full flex items-center justify-between gap-3 px-5 py-4 border rounded-lg transition-all", canUse ? "border-[#D4AF37]/20 bg-[#D4AF37]/5 hover:border-[#D4AF37]/40" : "border-white/8 bg-white/[0.02] hover:border-white/15")}>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", canUse ? "border-[#D4AF37]/30 bg-[#D4AF37]/10" : "border-white/10 bg-white/5")}>
            <MessageCircle className={cn("h-4 w-4", canUse ? "text-[#D4AF37]" : "text-white/40")} />
          </div>
          <div className="text-left">
            <span className={cn("block text-sm font-bold", canUse ? "text-[#D4AF37]" : "text-white/60")}>Ask Your Chart</span>
            <span className="block text-[10px] text-white/30 mt-0.5">{canUse ? 'Chat with your birth chart AI' : 'Unlock with Lite or Pro'}</span>
          </div>
        </div>
        {canUse ? <ChevronRight className="h-4 w-4 text-[#D4AF37]/50" /> : <Lock className="h-3.5 w-3.5 text-white/20" />}
      </button>

      <button onClick={() => canUse ? onValidatePast?.() : onActionGate('validator', 'PRO')} className="w-full flex items-center justify-between gap-3 px-5 py-3 border border-[#D4AF37]/30 border-dashed rounded-lg bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 transition-all">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-[#D4AF37]">Validate My Past</span>
        </div>
        {!canUse && <Lock className="h-3.5 w-3.5 text-[#D4AF37]/50" />}
      </button>
    </div>
  );
}
