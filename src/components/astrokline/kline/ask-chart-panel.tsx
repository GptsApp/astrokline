'use client';

import { useCallback, useRef, useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { Lock, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  profile: UserProfile;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_QUESTIONS = [
  'Should I change jobs this year?',
  'When is my best time for love?',
  'What\'s blocking my financial growth?',
  'Am I compatible with Scorpio?',
];

export function AskChartPanel({ profile, tier, onActionGate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPro = tier === 'PRO';
  const maxQuestions = 10;
  const remainingQuestions = maxQuestions - questionsUsed;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = useCallback(async (question?: string) => {
    const q = (question || input).trim();
    if (!q || isLoading || questionsUsed >= maxQuestions) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setIsLoading(true);
    setQuestionsUsed(n => n + 1);

    try {
      const res = await fetch('/api/astrology/ask-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, question: q }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process your question. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [input, isLoading, questionsUsed, maxQuestions, profile]);

  // Floating trigger button for non-PRO
  if (!isPro) {
    return (
      <button
        onClick={() => onActionGate('ask_chart', 'PRO')}
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-white/10 bg-[#0A0A14]/90 px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-[#D4AF37]/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)]"
      >
        <MessageCircle className="h-4 w-4 text-white/40 group-hover:text-[#D4AF37]" />
        <span className="text-xs font-bold text-white/50 group-hover:text-[#D4AF37]">Ask Your Chart</span>
        <Lock className="h-3 w-3 text-white/20" />
      </button>
    );
  }

  // Floating trigger for PRO
  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 300); }}
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-xl transition-all hover:bg-[#D4AF37]/20 hover:scale-105"
      >
        <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
        <span className="text-xs font-bold text-[#D4AF37]">Ask Your Chart</span>
        {remainingQuestions < maxQuestions && (
          <span className="ml-1 font-mono text-[9px] text-[#D4AF37]/50">{remainingQuestions} left</span>
        )}
      </button>
    );
  }

  // Chat panel
  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[70vh] w-full flex-col border-l border-t border-white/10 bg-[#0A0A14]/98 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:right-4 sm:h-[600px] sm:w-[400px] sm:border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-sm font-bold text-white/90">Ask Your Chart</span>
          <span className="font-mono text-[9px] text-white/30">{remainingQuestions}/{maxQuestions}</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/60">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle className="mb-3 h-8 w-8 text-[#D4AF37]/30" />
            <p className="mb-1 text-sm font-bold text-white/60">Ask anything about your chart</p>
            <p className="mb-6 text-xs text-white/30">Your birth data is automatically included</p>
            <div className="w-full space-y-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="w-full border border-white/5 bg-white/[0.02] px-4 py-2.5 text-left text-xs text-white/50 transition-all hover:border-[#D4AF37]/20 hover:text-white/70"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] px-4 py-3 text-[13px] leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#D4AF37]/15 text-white/90'
                : 'border border-white/5 bg-white/[0.02] text-white/70'
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-pulse bg-[#D4AF37]/40" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-pulse bg-[#D4AF37]/40" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-pulse bg-[#D4AF37]/40" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-3">
        {remainingQuestions <= 0 ? (
          <p className="text-center text-xs text-white/30">Monthly question limit reached. Resets next month.</p>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your chart anything..."
              className="flex-1 border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#D4AF37]/30 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 text-[#D4AF37] transition-all hover:bg-[#D4AF37]/20 disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
