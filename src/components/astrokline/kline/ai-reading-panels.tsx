'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  TransitEvent,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { ChevronDown, Lock, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

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
}

const MODULES: ModuleConfig[] = [
  {
    id: 'summary',
    title: 'Core Identity',
    icon: '🌌',
    requiredTier: 'FREE',
    shortDesc: 'Your core personality pattern.',
  },
  {
    id: 'career',
    title: 'Career',
    icon: '💼',
    requiredTier: 'LITE',
    shortDesc: 'Work direction, leverage, and timing.',
  },
  {
    id: 'wealth',
    title: 'Wealth',
    icon: '💎',
    requiredTier: 'LITE',
    shortDesc: 'Money patterns and financial decisions.',
  },
  {
    id: 'love',
    title: 'Relationships',
    icon: '❤️',
    requiredTier: 'LITE',
    shortDesc: 'Emotional patterns and relationship pressure points.',
  },
  {
    id: 'health',
    title: 'Health',
    icon: '⚕️',
    requiredTier: 'LITE',
    shortDesc: 'Energy management and burnout risks.',
  },
  {
    id: 'strengths',
    title: 'Strengths',
    icon: '🔥',
    requiredTier: 'PRO',
    shortDesc: 'Your strongest natural advantages.',
  },
  {
    id: 'shadow',
    title: 'Blindspots',
    icon: '🌑',
    requiredTier: 'PRO',
    shortDesc: 'Recurring mistakes and pressure patterns.',
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
    if (tier === 'GUEST') return; // Guests don't get AI hits to save costs
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
        'rounded-2xl'
      );
      setTimeout(() => {
        containerRef.current?.classList.remove(
          'ring-2',
          'ring-primary',
          'ring-offset-2',
          'ring-offset-background',
          'rounded-2xl'
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
        <h3 className="text-primary mb-2 text-[10px] font-bold tracking-[0.2em] uppercase md:text-xs">
          AI Reading
        </h3>
        <h2 className="mb-3 font-serif text-2xl font-bold text-white md:text-3xl">
          Direct Guidance By Life Area
        </h2>
        <p className="mx-auto max-w-xl text-sm text-white/50">
          {tier === 'GUEST'
            ? 'Sign up to unlock your personalized AI reading.'
            : 'Open a section below to get practical guidance for that part of life.'}
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-4">
        {tier === 'PRO' && selectedYear && yearFocusEvent && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Year Focus {selectedYear}
            </div>
            <h4 className="text-base font-bold text-white">
              {yearFocusEvent.title}
            </h4>
            <p className="mt-2 text-sm leading-7 text-white/70">
              {yearFocusEvent.description}
            </p>
            <p className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/82">
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
                'overflow-hidden rounded-2xl border transition-all duration-300',
                unlocked
                  ? 'hover:border-primary/30 border-white/10 bg-[#15131A]/80'
                  : 'cursor-not-allowed border-white/5 bg-black/40 opacity-80'
              )}
            >
              {/* Header Box (Trigger) */}
              <button
                type="button"
                onClick={() => handleModuleToggle(mod.id, mod.requiredTier)}
                className="group relative flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
              >
                <div className="z-10 flex items-center gap-4">
                  <span className="text-2xl opacity-80 transition-transform group-hover:scale-110">
                    {mod.icon}
                  </span>
                  <div>
                    <h4 className="mb-0.5 text-sm font-bold text-white md:text-base">
                      {mod.title}
                    </h4>
                    <p className="text-[10px] text-white/40 md:text-xs">
                      {mod.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="z-10 flex items-center gap-3">
                  {!unlocked ? (
                    <div className="group-hover:bg-primary/10 group-hover:border-primary/30 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-colors">
                      <Lock className="group-hover:text-primary h-3.5 w-3.5 text-white/50 transition-colors" />
                      <span className="group-hover:text-primary hidden text-[10px] font-bold tracking-wider text-white/50 uppercase transition-colors md:block">
                        {mod.requiredTier === 'LITE' ? 'Lite+' : 'Pro Only'}
                      </span>
                    </div>
                  ) : (
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-white/30 transition-transform duration-300',
                        isOpen && 'rotate-180'
                      )}
                    />
                  )}
                </div>

                {/* Visual glow on hover for locked modules */}
                {!unlocked && (
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
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
                  <div className="overflow-hidden">
                    <div className="border-t border-white/5 px-6 pt-2 pb-6">
                      {isLoading ? (
                        <div className="flex animate-pulse flex-col gap-3">
                          <div className="h-4 w-3/4 rounded bg-white/10" />
                          <div className="h-4 w-5/6 rounded bg-white/10" />
                          <div className="h-4 w-1/2 rounded bg-white/10" />
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-p:text-white/70 prose-strong:text-white/90 prose-h3:text-primary prose-h3:font-bold prose-h3:text-sm prose-h3:tracking-widest prose-h3:uppercase prose-h3:mt-8 prose-h3:mb-4 max-w-none">
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
          return <h3 key={i}>{p.replace('### ', '')}</h3>;
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
