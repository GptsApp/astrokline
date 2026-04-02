'use client';

import { useEffect, useRef, useState, type UIEvent } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Briefcase,
  Check,
  ChevronRight,
  Coins,
  Copy,
  Heart,
  Lock,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { Heading } from "@/components/astrokline/ui/heading";
import { InsightSection, AstroTextParser } from './insight-section';

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

interface Props {
  profile: UserProfile;
  isPremium?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

// AstroTextParser and InsightSection are now imported from ./insight-section

export function AiReadingFullscreen({
  profile,
  isPremium = false,
  isOpen,
  onClose,
}: Props) {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState(
    'Analyzing your cosmic blueprint...'
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight > target.clientHeight) {
      setScrollProgress(
        target.scrollTop / (target.scrollHeight - target.clientHeight)
      );
    }
  };

  useEffect(() => {
    if (loading) {
      const msgs = [
        'Analyzing your cosmic blueprint...',
        'Calculating exact planetary phases...',
        'Synthesizing depth psychology report...',
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % msgs.length;
        setLoadingText(msgs[i]);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (isOpen && !insight && !loading && !error) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleGenerate is guarded by loading/insight checks
  }, [isOpen, insight, loading, error]);

  async function handleGenerate() {
    if (loading || insight) return;
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

  function handleCopy() {
    if (!insight) return;
    const text = [
      `-- ${insight.nickname} --`,
      insight.coreQuote,
      '',
      '=== Core Identity ===',
      insight.summary,
      '',
      '=== Career & Ambition ===',
      insight.career,
      '',
      '=== Wealth & Abundance ===',
      insight.wealth,
      '',
      '=== Love & Connections ===',
      insight.relationships,
      '',
      '=== Energy & Vitality ===',
      insight.health,
      '',
      '=== Superpowers ===',
      insight.strengths,
      '',
      '=== Shadow Work ===',
      insight.warnings,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] overflow-x-hidden overflow-y-auto bg-[#020205]"
        onScroll={handleScroll}
      >
        <div
          className="bg-primary fixed top-0 right-0 left-0 z-[400] h-1 origin-left transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
        {/* Breathing Nebula Backgrounds */}
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[20%] left-[20%] h-[500px] w-[500px] bg-indigo-500/10 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 5,
            }}
            className="absolute right-[10%] bottom-[10%] h-[600px] w-[600px] bg-violet-600/10 blur-[150px]"
          />
        </div>
        {/* Top Bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#050508]/90 px-4 py-3 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to K-Line
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <span className="text-xs font-bold tracking-widest text-white/60 uppercase">
              AI Deep Reading
            </span>
          </div>
          <div className="flex items-center gap-2">
            {insight && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5  border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-all hover:bg-white/10 hover:text-white/90"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className=" p-1.5 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>
        </div>

        {/* Remove Premium Hard Block - It is moved to the bottom part of the report */}

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="bg-primary/10 border-primary/30 flex h-16 w-16 items-center justify-center border">
                <Brain className="text-primary h-8 w-8 animate-pulse" />
              </div>
              <div className="border-primary/20 absolute -inset-4 animate-ping border" />
            </div>
            <div className="space-y-2 text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="h-5 text-sm text-white/70"
                >
                  {loadingText}
                </motion.p>
              </AnimatePresence>
              <p className="pt-2 font-mono text-[11px] text-white/30">
                This deep analysis takes about 15-20 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <p className="text-sm text-rose-400">
              AI reading failed. Please try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(false);
                handleGenerate();
              }}
              className="bg-primary/20 text-primary hover:bg-primary/30  px-4 py-2 text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {insight && (
          <div
            ref={contentRef}
            className="relative mx-auto max-w-4xl space-y-10 px-4 py-8 md:px-8"
          >
            {/* Title Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-4 border-b border-white/5 pb-8 text-center"
            >
              <p className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">
                Powered by AstroKline Engine
              </p>
              {insight.nickname && (
                <Heading level={1} className="text-3xl text-white/90 md:text-5xl">
                  {insight.nickname}
                </Heading>
              )}
              {insight.coreQuote && (
                <p className="text-primary/80 mx-auto max-w-2xl font-serif text-lg leading-relaxed italic md:text-xl">
                  "{insight.coreQuote}"
                </p>
              )}
              <div className="flex items-center justify-center gap-4 pt-4 font-mono text-[11px] text-white/30">
                <span>{profile.sun.sign} Sun</span>
                <span className="h-1 w-1 bg-white/20" />
                <span>{profile.moon.sign} Moon</span>
                <span className="h-1 w-1 bg-white/20" />
                <span>{profile.rising.sign} Rising</span>
              </div>
            </motion.div>

            {/* Section 1: Core Identity */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 border-primary/20 flex h-10 w-10 items-center justify-center  border shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                  <Brain className="text-primary h-5 w-5" />
                </div>
                <div>
                  <Heading level={2} variant="card" className="text-xl text-white/90">
                    Core Identity Analysis
                  </Heading>
                  <p className="text-primary/50 mt-1 font-mono text-[11px] tracking-[0.2em] uppercase">
                    Sun-Moon-Rising Trinity
                  </p>
                </div>
              </div>
              <div className="pl-[52px]">
                <AstroTextParser text={insight.summary} />
              </div>
            </motion.section>

            {/* Section 2: Career */}
            {insight.career && (
              <InsightSection icon={Briefcase} title="Career & Ambition" subtitle="10th House / Midheaven Analysis" text={insight.career} iconColor="blue" />
            )}

            {/* Section 3: Wealth */}
            {insight.wealth && (
              <InsightSection icon={Coins} title="Wealth & Abundance" subtitle="2nd & 8th House Financial Blueprint" text={insight.wealth} iconColor="emerald" />
            )}

            {/* From Section 4 onwards, apply Free User Blur Overlay if not premium */}
            {!isPremium ? (
              <div className="relative mt-8 border-t border-white/5 pt-8">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#020205]/80 to-[#020205]" />
                <div className="absolute inset-x-0 top-32 z-20 flex flex-col items-center justify-center px-4">
                  <div className="border-primary/20 w-full max-w-xl  border bg-black/60 p-8 text-center shadow-[0_0_40px_rgba(212,175,55,0.1)] backdrop-blur-md">
                    <div className="bg-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                      <Lock className="text-primary h-6 w-6" />
                    </div>
                    <Heading level={3} variant="card" className="text-white/90">
                      Unlock Your Full Destiny
                    </Heading>
                    <p className="mt-2 text-sm text-white/60">
                      Discover your hidden karmic ties, holistic energy, and
                      shadow behaviors.
                    </p>
                    <Link
                      href="/pricing?highlight=lite"
                      className="bg-primary hover:bg-primary/90 mt-6 inline-flex w-full items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-all"
                    >
                      View Premium Plans <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="touch-none space-y-10 opacity-10 blur-md select-none">
                  {/* Blurry Section Preview */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center  border border-rose-500/20 bg-rose-500/10">
                      <Heart className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                      <Heading level={2} variant="card" className="text-xl text-white/90">
                        Love & Connections
                      </Heading>
                      <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-rose-400/50 uppercase">
                        Venus-Mars / 7th House Dynamics
                      </p>
                    </div>
                  </div>
                  <div className="h-32  bg-white/5 pl-[52px]" />

                  <div className="mt-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center  border border-teal-500/20 bg-teal-500/10">
                      <Activity className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <Heading level={2} variant="card" className="text-xl text-white/90">
                        Energy & Vitality
                      </Heading>
                      <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-teal-400/50 uppercase">
                        6th House / Mars-Saturn Influence
                      </p>
                    </div>
                  </div>
                  <div className="h-32  bg-white/5 pl-[52px]" />
                </div>
              </div>
            ) : (
              // Premium Content Continues
              <>
                {/* Section 4: Love */}
                {insight.relationships && (
                  <InsightSection icon={Heart} title="Love & Connections" subtitle="Venus-Mars / 7th House Dynamics" text={insight.relationships} iconColor="rose" />
                )}

                {/* Section 5: Health */}
                {insight.health && (
                  <InsightSection icon={Activity} title="Energy & Vitality" subtitle="6th House / Mars-Saturn Influence" text={insight.health} iconColor="teal" />
                )}

                {/* Section 6: Superpowers */}
                {insight.strengths && (
                  <InsightSection icon={Shield} title="Your Superpowers" subtitle="Core Strengths & Gifts" text={insight.strengths} iconColor="primary" />
                )}

                {/* Section 7: Shadow Work */}
                {insight.warnings && (
                  <InsightSection icon={AlertTriangle} title="Shadow Work" subtitle="Blind Spots & Growth Areas" text={insight.warnings} iconColor="amber" />
                )}

                <div className="pt-12 pb-8 text-center">
                  <Link
                    href="/pricing?highlight=pro"
                    className="bg-primary/20 border-primary/50 hover:bg-primary/30 inline-flex w-full items-center justify-center gap-2 border px-8 py-3 text-sm font-bold text-white transition-all sm:w-auto"
                  >
                    Book 1-on-1 Consultation{' '}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                {/* End of Premium conditional */}
              </>
            )}

            {/* Footer */}
            <div className="space-y-3 border-t border-white/5 pt-8 pb-12 text-center">
              <p className="font-mono text-[10px] tracking-widest text-white/20 uppercase">
                Report generated by AstroKline AI Engine
              </p>
              <p className="font-mono text-[10px] text-white/15">
                Based on Swiss Ephemeris DE431 calculations / Placidus house
                system
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-4 inline-flex items-center gap-2  border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50 transition-all hover:bg-white/10 hover:text-white/80"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied to Clipboard' : 'Copy Full Report'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
