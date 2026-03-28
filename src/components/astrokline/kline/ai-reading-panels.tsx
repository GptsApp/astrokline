'use client';

import { useEffect, useRef, useState } from 'react';
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
  tier: AppTier;
  onUpgradeClick: () => void;
  selectedYear?: number;
  yearFocusEvent?: TransitEvent | null;
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

export function AiReadingPanels({
  profile,
  tier,
  onUpgradeClick,
  selectedYear,
  yearFocusEvent,
}: Props) {
  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKeys | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Fetch the massive AI Reading payload silently if FREE+
  useEffect(() => {
    if (tier === 'GUEST' || tier === 'FREE') return; // Guests and Free users don't get AI hits to save costs
    let isMounted = true;
    setIsLoading(true);

    fetch('/api/astrology/ai-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && !data.error) {
          // Map backend keys to our modules
          setInsight({
            summary: data.summary,
            career: data.career,
            wealth: data.wealth,
            love: data.relationships, // Backend returns 'relationships'
            health: data.health,
            strengths: data.strengths,
            shadow: data.warnings, // Backend returns 'warnings'
          });
        }
      })
      .catch((err) => console.error('Failed to load AI reading', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, tier]);

  // 2-Way Binding: Scroll to readings when a K-Line node is clicked (PRO feature)
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
      onUpgradeClick();
      return;
    }
    setActiveModule(activeModule === id ? null : id);
  };

  return (
    <div className="mt-8 flex w-full flex-col gap-4" ref={containerRef}>
      <div className="mb-6 text-center">
        <Heading level={3} className="text-primary mb-2 text-[10px] font-bold tracking-[0.2em] uppercase md:text-xs">
          AI Reading
        </Heading>
        <Heading level={2} className="mb-3 font-serif text-2xl font-bold text-white md:text-3xl">
          What Your Chart Says About You
        </Heading>
        <p className="mx-auto max-w-xl text-sm text-white/50">
          {tier === 'GUEST'
            ? 'Create a free account to unlock your personalized reading.'
            : 'Tap any section below for practical, personalized advice.'}
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-4">
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
              {unlocked && (
                <div
                  className={cn(
                    'grid transition-all duration-500 ease-in-out',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="relative overflow-hidden">
                    {/* Active ambient glow */}
                    <div className="absolute -top-20 -left-20 h-40 w-40 bg-[#D4AF37]/10 blur-[60px]" />
                    
                    <div className="relative z-10 border-t border-white/[0.04] px-6 pt-2 pb-8">
                      {isLoading ? (
                        <div className="flex animate-pulse flex-col gap-3">
                          <div className="h-4 w-3/4 bg-white/[0.04]" />
                          <div className="h-4 w-5/6 bg-white/[0.04]" />
                          <div className="h-4 w-1/2 bg-white/[0.04]" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-p:text-white/60 prose-strong:text-white/90 prose-h3:text-[#D4AF37] prose-h3:font-normal prose-h3:text-xs prose-h3:tracking-widest prose-h3:uppercase prose-h3:mt-8 prose-h3:mb-4 max-w-none">
                          {insight?.[mod.id] ? (
                            <AstroTextParser text={insight[mod.id]} />
                          ) : (
                            <p className="text-white/30 italic">
                              No guidance recorded for this sector.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to render markdown-ish text from the AI
function AstroTextParser({ text }: { text: string }) {
  const normText = (text || '').replace(/\\n/g, '\n');
  const paragraphs = normText.split('\n\n').filter((p) => p.trim());

  return (
    <>
      {paragraphs.map((p, i) => {
        // Detect H3 Action Plan Headers
        if (p.startsWith('### ')) {
          return <Heading level={3} key={i}>{p.replace('### ', '')}</Heading>;
        }
        // Detect lists
        if (p.includes('\n- ')) {
          const lines = p.split('\n');
          return (
            <div key={i} className="mb-4">
              {lines.map((line, j) => {
                if (line.startsWith('- ')) {
                  return (
                    <li key={j} className="mb-1 ml-4 text-white/70">
                      {parseBold(line.substring(2))}
                    </li>
                  );
                }
                return <p key={j}>{parseBold(line)}</p>;
              })}
            </div>
          );
        }
        return <p key={i}>{parseBold(p)}</p>;
      })}
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
