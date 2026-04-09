'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type AiInsightData,
  getInsightCacheKey,
  getCachedInsight,
  setCachedInsight,
} from '@/lib/astrokline/ai-insight-cache';
import type {
  TransitEvent,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { ChevronDown, Lock, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Heading } from "@/components/astrokline/ui/heading";

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

interface Props {
  profile: UserProfile;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
  selectedYear?: number;
  yearFocusEvent?: TransitEvent | null;
  klineId?: string;
  initialInsight?: AiInsightData | null;
  onInsightResolved?: (insight: AiInsightData) => void;
}

// ── MODULE CONFIGURATION ──
// Defines which tier unlocks which insight block.
type ModuleKeys =
  | 'summary'
  | 'career'
  | 'wealth'
  | 'love'
  | 'health'
  | 'strengths'
  | 'shadow';

interface ModuleConfig {
  id: ModuleKeys;
  title: string;
  icon: string;
  requiredTier: AppTier;
  shortDesc: string;
  lockedTeaser?: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'summary',
    title: 'Who You Are',
    icon: '🌌',
    requiredTier: 'LITE',
    shortDesc: 'Your personality at a glance.',
    lockedTeaser: 'Your birth chart reveals a unique personality blueprint. Upgrade to discover your core traits, natural talents, and life themes.',
  },
  {
    id: 'career',
    title: 'Career & Direction',
    icon: '💼',
    requiredTier: 'LITE',
    shortDesc: 'Best timing for job changes and big projects.',
    lockedTeaser: 'Your chart shows a specific career window opening soon. See which years favor bold moves and which favor staying put.',
  },
  {
    id: 'wealth',
    title: 'Money & Finances',
    icon: '💎',
    requiredTier: 'LITE',
    shortDesc: 'Spending patterns and financial timing.',
    lockedTeaser: 'Your financial rhythm has clear peaks and valleys. Discover the best years for investing, saving, and taking calculated risks.',
  },
  {
    id: 'love',
    title: 'Relationships & Love',
    icon: '❤️',
    requiredTier: 'LITE',
    shortDesc: 'Connection patterns and compatibility insights.',
    lockedTeaser: 'A meaningful relationship shift is forming in your timeline. Learn when to deepen commitment and when to focus on yourself.',
  },
  {
    id: 'health',
    title: 'Energy & Wellness',
    icon: '⚕️',
    requiredTier: 'LITE',
    shortDesc: 'When to push hard and when to rest.',
    lockedTeaser: 'Your vitality follows a natural rhythm. See which years support peak performance and which call for extra rest and recovery.',
  },
  {
    id: 'strengths',
    title: 'Natural Strengths',
    icon: '🔥',
    requiredTier: 'PRO',
    shortDesc: 'The advantages you were born with.',
    lockedTeaser: 'You have a unique combination of traits that gives you an edge in specific areas. Discover what they are and how to use them.',
  },
  {
    id: 'shadow',
    title: 'Patterns to Watch',
    icon: '🌑',
    requiredTier: 'PRO',
    shortDesc: 'Recurring habits that hold you back.',
    lockedTeaser: 'Everyone has blind spots. Your chart reveals a recurring pattern that may be quietly limiting your growth. Awareness is the first step.',
  },
];

type PanelInsight = Partial<Record<ModuleKeys, string>>;

const LOADING_PHASE_WIDTH_CLASSES = [
  'w-[15%]',
  'w-[40%]',
  'w-[70%]',
  'w-[92%]',
] as const;

const SKELETON_WIDTH_CLASSES = [
  'w-[75%]',
  'w-[90%]',
  'w-[60%]',
  'w-[85%]',
  'w-[50%]',
] as const;

function normalizeInsight(raw?: AiInsightData | null): PanelInsight | null {
  if (!raw) {
    return null;
  }

  const mapped: PanelInsight = {
    summary: raw.summary,
    career: raw.career,
    wealth: raw.wealth,
    love: raw.relationships ?? raw.love,
    health: raw.health,
    strengths: raw.strengths,
    shadow: raw.warnings ?? raw.shadow,
  };

  return Object.values(mapped).some(Boolean) ? mapped : null;
}

export function AiReadingPanels({
  profile,
  tier,
  onActionGate,
  selectedYear,
  yearFocusEvent,
  klineId,
  initialInsight,
  onInsightResolved,
}: Props) {
  const [resolvedInsight, setResolvedInsight] = useState<AiInsightData | null>(
    initialInsight ?? null
  );
  const [insight, setInsight] = useState<PanelInsight | null>(() =>
    normalizeInsight(initialInsight)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKeys | null>('summary');
  const [astroSystem, setAstroSystem] = useState<'PARASHARA'|'JAIMINI'>('PARASHARA');

  const containerRef = useRef<HTMLDivElement>(null);
  const persistedInsightKeyRef = useRef('');

  // Determine if a module is unlocked based on tier precedence
  const isUnlocked = (reqTier: AppTier) => {
    if (tier === 'PRO') return true;
    if (
      tier === 'LITE' &&
      (reqTier === 'LITE' || reqTier === 'FREE' || reqTier === 'GUEST')
    )
      return true;
    if (tier === 'FREE' && (reqTier === 'FREE' || reqTier === 'GUEST'))
      return true;
    if (tier === 'GUEST' && reqTier === 'GUEST') return true;
    return false;
  };

  // Loading phase for animated progress
  const [loadingPhase, setLoadingPhase] = useState(0);
  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startLoadingPhases = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    setLoadingPhase(0);
    phaseTimers.current.push(setTimeout(() => setLoadingPhase(1), 2000));
    phaseTimers.current.push(setTimeout(() => setLoadingPhase(2), 5000));
    phaseTimers.current.push(setTimeout(() => setLoadingPhase(3), 10000));
  };

  const stopLoadingPhases = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
  };

  const applyInsight = (nextInsight: AiInsightData) => {
    const normalized = normalizeInsight(nextInsight);
    if (!normalized) {
      return;
    }

    setResolvedInsight(nextInsight);
    setInsight(normalized);
    onInsightResolved?.(nextInsight);
  };

  const persistInsight = async (nextInsight: AiInsightData) => {
    if (!klineId) {
      return;
    }

    const persistKey = `${klineId}:${JSON.stringify(nextInsight)}`;
    if (persistedInsightKeyRef.current === persistKey) {
      return;
    }

    persistedInsightKeyRef.current = persistKey;

    try {
      await fetch('/api/kline/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klineId, insight: nextInsight }),
      });
    } catch {
      persistedInsightKeyRef.current = '';
    }
  };

  // Fetch with localStorage cache layer
  useEffect(() => {
    if (tier === 'GUEST' || tier === 'FREE') return;
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    if (normalizeInsight(initialInsight)) {
      applyInsight(initialInsight!);
      return () => {
        isMounted = false;
      };
    }

    // ── 1. Check localStorage cache first ──
    const cacheKey = getInsightCacheKey(profile);
    const cached = getCachedInsight(cacheKey) as AiInsightData | null;
    if (normalizeInsight(cached)) {
      applyInsight(cached!);
      void persistInsight(cached!);
      return; // No API call needed!
    }

    // ── 2. Cache miss — fetch from API ──
    const fetchInsight = () => {
      setIsLoading(true);
      startLoadingPhases();
      fetch('/api/astrology/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data && !data.error) {
            applyInsight(data);
            // Write to localStorage cache — only for real AI results
            if (!data._fallback) {
              setCachedInsight(cacheKey, data);
              void persistInsight(data);
            }
          } else if (isMounted && retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchInsight, 2000);
            return;
          }
        })
        .catch((err) => {
          console.error('Failed to load AI reading', err);
          if (isMounted && retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchInsight, 3000);
            return;
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
            stopLoadingPhases();
          }
        });
    };

    fetchInsight();

    return () => {
      isMounted = false;
      stopLoadingPhases();
    };
  }, [initialInsight, klineId, onInsightResolved, profile, tier]);

  // 2-way binding: scroll to readings when a Life Curve node is clicked (PRO feature)
  useEffect(() => {
    if (tier === 'PRO' && selectedYear && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Optionally glow or pulse the container to draw attention
      containerRef.current.classList.add(
        'ring-2',
        'ring-primary',
        'ring-offset-2',
        'ring-offset-background',
        ''
      );
      setTimeout(() => {
        containerRef.current?.classList.remove(
          'ring-2',
          'ring-primary',
          'ring-offset-2',
          'ring-offset-background',
          ''
        );
      }, 2000);
    }
  }, [selectedYear, tier]);

  useEffect(() => {
    if (tier !== 'PRO' || !selectedYear || !yearFocusEvent) {
      return;
    }

    const focusModuleMap: Record<
      TransitEvent['theme'],
      Exclude<ModuleKeys, 'shadow'>
    > = {
      Career: 'career',
      Wealth: 'wealth',
      Love: 'love',
      Growth: 'strengths',
    };

    setActiveModule(focusModuleMap[yearFocusEvent.theme]);
  }, [selectedYear, tier, yearFocusEvent]);

  // Handle module click (Progressive Disclosure)
  const handleModuleToggle = (id: ModuleKeys, reqTier: AppTier) => {
    if (!isUnlocked(reqTier)) {
      onActionGate(id, reqTier);
      return;
    }
    setActiveModule(activeModule === id ? null : id);
  };

  return (
    <div className="mt-8 flex w-full flex-col gap-4" ref={containerRef}>
      <div className="mb-6 text-center">
        <Heading level={3} className="text-primary mb-2 text-[10px] font-bold tracking-[0.2em] uppercase md:text-xs">
          Your Personal Reading
        </Heading>
        <Heading level={2} className="mb-3 font-serif text-2xl font-bold text-white md:text-3xl">
          What We See in Your Chart
        </Heading>
        <p className="mx-auto max-w-xl text-sm text-white/50">
          {tier === 'GUEST'
            ? 'Create a free account to unlock your personalized reading.'
            : 'Tap any section below for practical, personalized advice.'}
        </p>
      </div>

      {/* Jaimini High-Dimensional Toggle */}
      <div className="mx-auto flex w-full justify-center mb-4">
        <div className="flex bg-[#0A0A0F]/80 border border-white/5 p-1 rounded">
          <button 
             onClick={() => setAstroSystem('PARASHARA')}
             className={cn("px-4 py-1.5 text-[10px] sm:text-xs font-mono tracking-widest transition-colors uppercase", astroSystem === 'PARASHARA' ? "bg-white/10 text-white font-bold" : "text-white/40")}
          >
             Parashara
          </button>
          <button 
             onClick={() => setAstroSystem('JAIMINI')}
             className={cn("px-4 py-1.5 text-[10px] sm:text-xs font-mono tracking-widest transition-colors flex items-center gap-1.5 uppercase", astroSystem === 'JAIMINI' ? "bg-[#D4AF37]/20 text-[#D4AF37] font-bold" : "text-white/40")}
          >
             <span className="text-[10px] -mt-0.5">🪷</span> Jaimini
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-4 relative">
        {/* Jaimini Pro-Exclusive Overlay */}
        {tier !== 'PRO' && astroSystem === 'JAIMINI' && (
           <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
             <div className="bg-[#050505]/90 border border-[#D4AF37]/50 p-8 text-center shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-xl max-w-sm mt-10">
               <span className="text-4xl mb-4 block animate-pulse">🪷</span>
               <Heading level={3} className="text-[#D4AF37] mb-3 text-lg font-serif">The Soul Perspective</Heading>
               <p className="text-xs text-white/70 mb-8 leading-relaxed font-mono">
                 Jaimini astrology abandons material interpretations to reveal your Karakamsha—your absolute soul purpose.<br/><br/>This high-dimensional analysis requires PRO access.
               </p>
               <button onClick={() => onActionGate?.('jaimini', 'PRO')} className="bg-[#D4AF37] px-8 py-3 text-black font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#D4AF37]/90 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                 Unlock Soul Insight
               </button>
             </div>
           </div>
        )}

        {/* Content Wrapper that blurs when Jaimini is selected but user is not Pro */}
        <div className={cn("flex flex-col space-y-4 transition-all duration-1000", astroSystem === 'JAIMINI' && tier !== 'PRO' ? "blur-md opacity-40 select-none pointer-events-none" : "")}>
        {tier === 'PRO' && selectedYear && yearFocusEvent && (
          <div className=" border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] p-6 lg:p-8">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              <Sparkles className="h-3 w-3" />
              Year Focus {selectedYear}
            </div>
            <Heading level={4} className="font-serif text-2xl text-white/90">
              {yearFocusEvent.title}
            </Heading>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {yearFocusEvent.description}
            </p>
            <p className="mt-5 border-l-2 border-[#D4AF37]/40 bg-white/[0.02] px-5 py-4 text-[13px] leading-relaxed text-white/80">
              {yearFocusEvent.advice}
            </p>
          </div>
        )}

        {MODULES.map((mod) => {
          const unlocked = isUnlocked(mod.requiredTier);
          const isOpen = activeModule === mod.id;

          return (
            <div
              key={mod.id}
              className={cn(
                'overflow-hidden border backdrop-blur-sm transition-all duration-500',
                unlocked
                  ? isOpen 
                    ? 'border-[#D4AF37]/20 bg-[#D4AF37]/[0.02]' 
                    : 'border-white/[0.04] bg-[#0A0A0F]/80 hover:bg-[#0A0A0F] hover:border-white/[0.08]'
                  : 'cursor-not-allowed border-white/[0.02] bg-[#050505]/50 opacity-60'
              )}
            >
              {/* Header Box (Trigger) */}
              <button
                type="button"
                onClick={() => handleModuleToggle(mod.id, mod.requiredTier)}
                className="group relative flex w-full flex-col px-6 py-5 text-left focus:outline-none"
              >
                <div className="flex w-full items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl opacity-80 transition-transform group-hover:scale-110">
                      {mod.icon}
                    </span>
                    <div>
                      <Heading level={4} className="mb-0.5 text-sm font-bold text-white/90 md:text-base">
                        {mod.title}
                      </Heading>
                      <p className="font-mono tracking-wide text-[10px] text-white/30 md:text-[11px] uppercase mt-1">
                        {mod.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!unlocked ? (
                      <div className="group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 flex items-center gap-2 border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 transition-colors">
                        <Lock className="group-hover:text-[#D4AF37] h-3.5 w-3.5 text-white/40 transition-colors" />
                        <span className="group-hover:text-[#D4AF37] hidden text-[9px] font-bold tracking-widest text-white/40 uppercase transition-colors md:block">
                          Unlock
                        </span>
                      </div>
                    ) : (
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 text-white/30 transition-transform duration-500',
                          isOpen && 'rotate-180 text-[#D4AF37]'
                        )}
                      />
                    )}
                  </div>
                </div>

                {!unlocked && mod.lockedTeaser && (
                  <div className="mt-5 w-full z-10">
                     <div className="relative overflow-hidden  border border-[#D4AF37]/30 bg-[#050505] p-6 transition-colors duration-300 group-hover:border-[#D4AF37]/50">
                       <div className="mb-3 flex items-center justify-between opacity-50">
                          <span className="font-mono text-[9px] tracking-widest text-[#D4AF37] uppercase">Preview</span>
                          <Lock className="h-3 w-3 text-[#D4AF37]" />
                       </div>
                       
                       <p className="blur-[3px] text-[11px] leading-relaxed text-white/20 select-none font-mono">
                         Your personalized analysis for this life area has been generated.<br/> 
                         It includes specific timing recommendations, key years to watch,<br/> 
                         and practical guidance based on your unique birth chart data.
                       </p>
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 p-6 text-center backdrop-blur-[2px]">
                         <span className="text-[13px] leading-relaxed font-semibold text-white/90 drop-shadow-lg max-w-[95%] mx-auto">
                           {mod.lockedTeaser}
                         </span>
                       </div>
                     </div>
                  </div>
                )}

                {/* Visual glow on hover for locked modules */}
                {!unlocked && (
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transition-transform duration-1000 group-hover:translate-x-[100%] z-0" />
                )}
              </button>

              {/* Expander Content */}
              <AnimatePresence initial={false}>
                {unlocked && isOpen ? (
                  <motion.div
                    key={`${mod.id}-content`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      <div className="absolute -top-20 -left-20 h-40 w-40 bg-[#D4AF37]/10 blur-[60px]" />

                      <div className="relative z-10 border-t border-white/[0.04] px-6 pt-2 pb-8">
                        {isLoading ? (
                          <div className="flex flex-col items-center gap-4 py-8">
                            <div className="relative h-1 w-full max-w-xs overflow-hidden bg-white/[0.04]">
                              <div
                                className={cn(
                                  'absolute inset-y-0 left-0 bg-[#D4AF37]/60 transition-all duration-1000 ease-out',
                                  LOADING_PHASE_WIDTH_CLASSES[loadingPhase]
                                )}
                              />
                            </div>
                            <div className="flex items-center gap-2 text-white/40">
                              <Sparkles className="h-4 w-4 animate-pulse text-[#D4AF37]/50" />
                              <span className="text-sm transition-opacity duration-500">
                                {[
                                  'Reading your birth chart...',
                                  'Analyzing planetary aspects...',
                                  'Writing your personalized insight...',
                                  'Almost there, crafting final details...',
                                ][loadingPhase]}
                              </span>
                            </div>
                            <div className="mt-2 w-full space-y-3">
                              {SKELETON_WIDTH_CLASSES.map((widthClass, i) => (
                                <div
                                  key={widthClass}
                                  className={cn(
                                    'h-3.5 animate-pulse bg-white/[0.03]',
                                    widthClass,
                                    i > 0 && 'animation-delay-[150ms]'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-p:text-white/60 prose-strong:text-white/90 prose-h3:text-[#D4AF37] prose-h3:font-normal prose-h3:text-xs prose-h3:tracking-widest prose-h3:uppercase prose-h3:mt-8 prose-h3:mb-4 max-w-none">
                            {insight?.[mod.id] ? (
                              <AstroTextParser text={insight[mod.id] as string} />
                            ) : (
                              <div className="flex flex-col items-center gap-3 py-4 text-center">
                                <div className="flex items-center gap-2 text-white/30">
                                  <Sparkles className="h-4 w-4 animate-pulse text-[#D4AF37]/50" />
                                  <span className="text-sm">This section is being prepared for your chart.</span>
                                </div>
                                <p className="text-[11px] text-white/20">Try another section now, then come back in a moment.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// Helper to render markdown-ish text from the AI
function AstroTextParser({ text }: { text: string }) {
  const normText = (text || '').replace(/\\n/g, '\n');
  const paragraphs = normText.split('\n\n').filter((p) => p.trim());

  // Separate main content from action steps
  let isInActionSection = false;
  const mainContent: { text: string; idx: number }[] = [];
  const actionSteps: string[] = [];

  paragraphs.forEach((p, i) => {
    if (p.startsWith('### Next Steps') || p.startsWith('### Action Steps') || p.startsWith('### next steps')) {
      isInActionSection = true;
      return;
    }
    if (isInActionSection) {
      // Collect bullet items as action steps
      if (p.includes('- ')) {
        const lines = p.split('\n').filter(l => l.trim().startsWith('- '));
        lines.forEach(l => actionSteps.push(l.replace(/^-\s*/, '')));
      } else if (p.trim().startsWith('- ')) {
        actionSteps.push(p.trim().replace(/^-\s*/, ''));
      }
      return;
    }
    mainContent.push({ text: p, idx: i });
  });

  return (
    <>
      {mainContent.map(({ text: p, idx: i }) => {
        if (p.startsWith('### ')) {
          return <Heading level={3} key={i}>{p.replace('### ', '')}</Heading>;
        }
        if (p.includes('\n- ')) {
          const lines = p.split('\n');
          const bulletLines = lines
            .filter((line) => line.startsWith('- '))
            .map((line) => line.substring(2));
          const paragraphLines = lines.filter((line) => !line.startsWith('- '));

          return (
            <div key={i} className="mb-4">
              {paragraphLines.map((line, j) => <p key={`${i}-p-${j}`}>{parseBold(line)}</p>)}
              {bulletLines.length > 0 && (
                <ul className="ml-4 list-disc space-y-1 text-white/70">
                  {bulletLines.map((line, j) => (
                    <li key={`${i}-li-${j}`}>{parseBold(line)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        }
        if (p.trim().startsWith('- ')) {
          const bulletLines = p
            .split('\n')
            .filter((line) => line.startsWith('- '))
            .map((line) => line.substring(2));

          return (
            <ul key={i} className="ml-4 list-disc space-y-1 text-white/70">
              {bulletLines.map((line, j) => (
                <li key={`${i}-single-${j}`}>{parseBold(line)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{parseBold(p)}</p>;
      })}

      {/* ── Upgraded Action Steps Card ── */}
      {actionSteps.length > 0 && (
        <div className="mt-8 border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center bg-[#D4AF37]/20 text-[10px] text-[#D4AF37]">🎯</span>
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              Your Action Plan
            </span>
          </div>
          <div className="space-y-3">
            {actionSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#D4AF37]/30 bg-[#D4AF37]/10 font-mono text-[10px] font-bold text-[#D4AF37]">
                  {i + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-white/70 group-hover:text-white/90 transition-colors">
                  {parseBold(step)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-[#D4AF37] opacity-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
