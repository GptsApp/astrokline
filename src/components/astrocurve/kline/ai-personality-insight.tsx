'use client';

import { Heading } from "@/components/astrocurve/ui/heading";

import { useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Brain,
  Briefcase,
  Coins,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  isPremium?: boolean;
}

interface InsightData {
  nickname: string;
  coreQuote: string;
  summary: string;
  career: string;
  relationships: string;
  wealth: string;
  health: string;
  strengths: string;
  warnings: string;
}

export function AiPersonalityInsight({ profile, isPremium = false }: Props) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [triggered, setTriggered] = useState(false);

  async function handleTrigger() {
    if (loading || insight) return;
    setTriggered(true);
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/astrology/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInsight(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // ── CTA Button (before trigger) ──
  if (!triggered) {
    return (
      <div className="relative flex w-full flex-col items-center pb-8">
        {/* Title */}
        <Heading level={3} className="mb-4 text-[10px] font-bold tracking-widest text-white/40 uppercase">
          AI Reading CTA
        </Heading>

        <button
          type="button"
          onClick={handleTrigger}
          className="group relative w-full max-w-2xl overflow-hidden  shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-[0.98]"
        >
          {/* subtle shine effect */}
          <div className="absolute inset-0 z-10 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/30 to-white/0 transition-transform duration-1000 ease-in-out group-hover:translate-x-[100%]" />

          <div className="relative z-0 flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-b from-[#e5c147] to-[#c5a028] px-4 py-4 transition-colors md:py-5">
            <Heading level={4} className="flex items-center gap-2 text-base font-bold text-black md:text-lg">
              <Sparkles
                className="h-4 w-4 text-black md:h-5 md:w-5"
                fill="currentColor"
              />
              Get Your AI Personality Reading
            </Heading>
            <p className="text-[11px] font-medium text-black/80 md:text-xs">
              Personalized insights powered by Gemini AI
            </p>
          </div>
        </button>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="border-primary/20 flex w-full flex-col items-center gap-4  border bg-[#111015]/90 p-8 backdrop-blur-xl">
        <div className="bg-primary/10 flex h-10 w-10 animate-pulse items-center justify-center">
          <Brain className="text-primary h-5 w-5" />
        </div>
        <p className="text-muted-foreground animate-pulse text-sm">
          AI is analyzing your cosmic blueprint...
        </p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="w-full space-y-3  border border-rose-500/20 bg-[#111015]/90 p-6 text-center">
        <p className="text-sm text-rose-400">
          AI reading failed. Please try again.
        </p>
        <button
          type="button"
          onClick={() => {
            setTriggered(false);
            setError(false);
          }}
          className="text-primary text-xs hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insight) return null;

  // ── Result ──
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="border-primary/20 relative w-full overflow-hidden  border bg-gradient-to-br from-[#111015] to-[#0d0b14] backdrop-blur-xl"
      >
        {/* Glow */}
        <div className="bg-primary/5 pointer-events-none absolute top-0 left-1/3 h-[200px] w-[200px] blur-[80px]" />

        {/* Header */}
        <div className="relative z-10 p-4 pb-0 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 border-primary/30 flex h-8 w-8 items-center justify-center border">
              <Sparkles className="text-primary h-4 w-4" />
            </div>
            <div>
              <Heading level={3} className="text-sm font-bold tracking-wide text-white/90 uppercase">
                AI Personality Insight
              </Heading>
              <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
                Powered by Gemini 2.5 Flash
              </p>
            </div>
          </div>

          {/* Nickname Badge */}
          {insight.nickname && (
            <div className="bg-primary/10 border-primary/30 mb-4 inline-flex items-center gap-2 border px-4 py-2">
              <span className="text-primary text-sm font-bold">
                「{insight.nickname}」
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6 p-4 sm:p-6">
          {/* Core Quote */}
          {insight.coreQuote && (
            <div className="from-primary/5 via-primary/10 to-primary/5 border-primary/20  border bg-gradient-to-r px-5 py-4 text-center shadow-[0_0_20px_rgba(212,175,55,0.05)]">
              <p className="text-primary/90 font-serif text-lg leading-relaxed font-semibold italic md:text-xl">
                「{insight.coreQuote}」
              </p>
            </div>
          )}

          {/* Intro Section */}
          <div className="space-y-3  border border-white/5 bg-white/[0.02] p-5">
            <Heading level={4} className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2 text-sm font-bold tracking-widest text-white/80 uppercase">
              <Brain className="text-primary h-4 w-4" />
              Your Personality
            </Heading>
            <p className="text-sm leading-[1.8] whitespace-pre-line text-white/70 md:text-[15px]">
              {insight.summary}
            </p>
          </div>

          {/* Four Dimensions Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Career */}
            {insight.career && (
              <div className="space-y-3  border border-blue-500/10 bg-blue-500/5 p-5 transition-colors hover:bg-blue-500/10">
                <div className="flex items-center justify-between border-b border-blue-500/10 pb-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Career & Ambition
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
                  {insight.career}
                </p>
              </div>
            )}

            {/* Wealth */}
            {insight.wealth && (
              <div className="space-y-3  border border-emerald-500/10 bg-emerald-500/5 p-5 transition-colors hover:bg-emerald-500/10">
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Coins className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Wealth & Abundance
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
                  {insight.wealth}
                </p>
              </div>
            )}

            {/* Relationships */}
            {insight.relationships && (
              <div className="space-y-3  border border-rose-500/10 bg-rose-500/5 p-5 transition-colors hover:bg-rose-500/10">
                <div className="flex items-center justify-between border-b border-rose-500/10 pb-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Love & Connections
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
                  {insight.relationships}
                </p>
              </div>
            )}

            {/* Health */}
            {insight.health && (
              <div className="space-y-3  border border-teal-500/10 bg-teal-500/5 p-5 transition-colors hover:bg-teal-500/10">
                <div className="flex items-center justify-between border-b border-teal-500/10 pb-2">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-bold tracking-wider uppercase">
                      Energy & Vitality
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
                  {insight.health}
                </p>
              </div>
            )}
          </div>

          {/* Strengths & Warnings */}
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            {insight.strengths && (
              <div className="bg-primary/5 border-primary/20 space-y-3  border p-5">
                <div className="text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Key Strengths
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
                  {insight.strengths}
                </p>
              </div>
            )}

            {insight.warnings && (
              <div className="space-y-3  border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Growth Areas
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
                  {insight.warnings}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
