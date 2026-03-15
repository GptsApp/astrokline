'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Shield, AlertTriangle } from 'lucide-react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';

interface Props {
  profile: UserProfile;
  isPremium?: boolean;
}

interface InsightData {
  nickname: string;
  coreQuote: string;
  summary: string;
  strengths: string;
  warnings: string;
}

export function AiPersonalityInsight({ profile, isPremium = false }: Props) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchInsight() {
      try {
        setLoading(true);
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

    fetchInsight();
  }, [profile]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-primary/20 bg-[#111015]/90 backdrop-blur-xl p-8 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">AI is analyzing your cosmic blueprint...</p>
      </div>
    );
  }

  if (error || !insight) {
    return null; // Silently fail — don't break the page
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full rounded-2xl border border-primary/20 bg-gradient-to-br from-[#111015] to-[#0d0b14] backdrop-blur-xl overflow-hidden relative"
    >
      {/* Glow */}
      <div className="absolute top-0 left-1/3 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 pb-0 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90 tracking-wide uppercase">AI Personality Insight</h3>
            <p className="text-[10px] text-white/40 tracking-widest uppercase font-mono">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        {/* Nickname Badge */}
        {insight.nickname && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <span className="text-sm font-bold text-primary">「{insight.nickname}」</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 relative z-10">
        {/* Core Quote — Soul Tagline */}
        {insight.coreQuote && (
          <div className="text-center py-3 px-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-base md:text-lg font-serif text-primary/90 italic leading-relaxed">
              「{insight.coreQuote}」
            </p>
          </div>
        )}

        {/* Summary — Deep Analysis */}
        <div className="space-y-2">
          <p className="text-sm md:text-[15px] text-white/80 leading-[1.8] whitespace-pre-line">{insight.summary}</p>
        </div>

        {/* Strengths */}
        {insight.strengths && (
          <div className="space-y-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Your Strengths</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{insight.strengths}</p>
          </div>
        )}

        {/* Warnings */}
        {insight.warnings && (
          <div className="space-y-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Watch Out</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{insight.warnings}</p>
          </div>
        )}

        {/* Premium upsell for free users */}
        {!isPremium && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center space-y-2">
            <p className="text-xs text-white/50">Premium members get deeper AI analysis with career, relationship & wealth predictions</p>
            <a href="/#pricing" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition">
              <Sparkles className="w-3 h-3" /> Unlock Full AI Reading
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
