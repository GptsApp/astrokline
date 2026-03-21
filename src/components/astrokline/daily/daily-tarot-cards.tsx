'use client';

import { MysticalBorder } from '@/components/astrokline/ui/mystical-border';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Briefcase,
  Coins,
  Heart,
  Lock,
  Navigation,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

const DAILY_WEATHER_DATA = [
  {
    id: 'love',
    title: 'Love & Connections',
    icon: Heart,
    score: 92,
    color: 'from-pink-500/20 to-rose-500/5',
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    transit: 'Venus 120° Mars',
    theme: 'Magnetic Attraction',
    summary:
      'Your aura is exceptionally charismatic today. A powerful trine between Venus and Mars activates your relationship sector, making this an ideal time for deep connections.',
    advice:
      'Express your feelings openly but avoid rushing commitments. A surprise encounter around evening could be significant.',
    isLocked: false,
    energyStatus: 'GREEN',
  },
  {
    id: 'career',
    title: 'Career & Ambition',
    icon: Briefcase,
    score: 85,
    color: 'from-blue-500/20 to-cyan-500/5',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    transit: 'Mercury in 10th House',
    theme: 'Strategic Visibility',
    summary:
      'Professional communication flows effortlessly. With Mercury illuminating your career zone, superiors are highly receptive to your innovative ideas.',
    advice:
      "Pitch that concept you've been working on. Schedule important meetings before 3 PM for maximum impact.",
    isLocked: false,
    energyStatus: 'GREEN',
  },
  {
    id: 'wealth',
    title: 'Wealth & Assets',
    icon: Coins,
    score: 45,
    color: 'from-emerald-500/20 to-teal-500/5',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    transit: 'Saturn Square Sun',
    theme: 'Financial Prudence',
    summary:
      "Cosmic weather demands strict financial discipline today. Saturn's restrictive influence suggests delays in expected returns or unexpected necessary expenses.",
    advice:
      'Halt all speculative investments. Focus instead on budgeting, reviewing subscriptions, and long-term asset structuring.',
    isLocked: true, // Mocking user Tier logic
    energyStatus: 'RED',
  },
  {
    id: 'health',
    title: 'Physical & Mental Vitality',
    icon: Activity,
    score: 70,
    color: 'from-purple-500/20 to-violet-500/5',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-500/10',
    transit: 'Moon Square Neptune',
    theme: 'Energy Conservation',
    summary:
      'Physical stamina is adequate, but mental fog is highly likely due to Neptunian haze. Your empathic output may drain your core reserves today.',
    advice:
      'Prioritize grounding exercises like walking in nature. Swap high-intensity interval training for restorative yoga or meditation.',
    isLocked: true, // Mocking user Tier logic
    energyStatus: 'AMBER',
  },
];

interface DailyTarotCardsProps {
  userTier?: 'FREE' | 'PRO' | 'PREMIUM';
}

export function DailyTarotCards({ userTier = 'FREE' }: DailyTarotCardsProps) {
  const hasProAccess = userTier === 'PRO' || userTier === 'PREMIUM';

  // Override locked state based on props
  const cards = DAILY_WEATHER_DATA.map((card) => ({
    ...card,
    isLocked: !hasProAccess && (card.id === 'wealth' || card.id === 'health'),
  }));

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group flex"
          >
            <MysticalBorder
              className={cn(
                'flex w-full flex-col border border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500',
                !card.isLocked &&
                  'hover:bg-white/[0.03] hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]'
              )}
            >
              {/* Ambient Gradient */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 bg-gradient-to-b opacity-40 transition-opacity duration-500',
                  card.color,
                  'group-hover:opacity-60'
                )}
              />

              <div className="relative z-20 flex h-full flex-col gap-5 p-6">
                {/* Header: Icon + Score */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl border border-white/5',
                        card.accentBg,
                        card.accent
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {!card.isLocked ? (
                    <div className="font-serif text-5xl leading-none font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                      {card.score}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <Lock className="mb-1 h-4 w-4 text-white/30" />
                      <span className="font-serif text-4xl leading-none font-bold tracking-tighter text-white/10">
                        --
                      </span>
                    </div>
                  )}
                </div>
                {/* Title & Theme */}
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="mb-1 font-serif text-xl leading-snug tracking-tight text-white">
                      {card.title}
                    </h3>

                    {/* Traffic Light Energy Status */}
                    <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full shadow-[0_0_8px]',
                          card.energyStatus === 'GREEN'
                            ? 'bg-emerald-500 shadow-emerald-500/50'
                            : card.energyStatus === 'AMBER'
                              ? 'bg-amber-500 shadow-amber-500/50'
                              : 'bg-red-500 shadow-red-500/50'
                        )}
                      />
                      <span
                        className={cn(
                          'text-[10px] font-bold tracking-wider',
                          card.energyStatus === 'GREEN'
                            ? 'text-emerald-400'
                            : card.energyStatus === 'AMBER'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        )}
                      >
                        {card.energyStatus}
                      </span>
                    </div>
                  </div>
                  {!card.isLocked && (
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          'font-mono text-xs tracking-wider uppercase',
                          card.accent
                        )}
                      >
                        {card.theme}
                      </span>
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />

                {/* Content Area */}
                {!card.isLocked ? (
                  <div className="flex flex-grow flex-col gap-4">
                    {/* Transit Data */}
                    <div className="flex w-fit items-center gap-2 rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
                      <Sparkles className="text-primary/70 h-3 w-3" />
                      {card.transit}
                    </div>

                    {/* AI Summary */}
                    <p className="text-sm leading-relaxed text-white/70">
                      {card.summary}
                    </p>

                    {/* Action Advice */}
                    <div className="mt-auto border-t border-white/5 pt-4">
                      <div className="flex items-start gap-2">
                        <Navigation className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p className="text-sm leading-relaxed font-medium text-white/90">
                          <span className="text-primary/80 mr-1">
                            Guidance:
                          </span>
                          {card.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group/lock relative flex flex-grow flex-col justify-center overflow-hidden rounded-xl">
                    {/* Fake Blurred Content */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col gap-4 pt-2 opacity-30 blur-[6px] transition-all duration-700 select-none group-hover/lock:opacity-20 group-hover/lock:blur-[8px]">
                      <div className="w-fit rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-transparent">
                        Transit: Mars Trine Pluto
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-[90%] rounded bg-white/80" />
                        <div className="h-2.5 w-[70%] rounded bg-white/80" />
                        <div className="h-2.5 w-[85%] rounded bg-white/80" />
                      </div>
                      <div className="mt-auto flex items-start gap-2 border-t border-white/5 pt-2">
                        <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-white/80" />
                        <div className="h-2.5 w-full rounded bg-white/80" />
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="relative z-10 flex h-full flex-col items-center justify-center px-2 text-center">
                      <div className="bg-primary/10 border-primary/20 mb-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-transform group-hover/lock:scale-110">
                        <Lock className="text-primary h-4 w-4" />
                      </div>
                      <p className="mb-4 text-xs leading-relaxed text-white/60">
                        Unlock premium transit data and AI guidance for this
                        dimension.
                      </p>
                      <a
                        href="/pricing"
                        className="group/btn bg-primary/10 hover:bg-primary/20 border-primary/30 relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border px-4 py-2.5 shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all"
                      >
                        <span className="text-primary text-xs font-bold transition-transform group-hover/btn:scale-105">
                          Unlock Now
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </MysticalBorder>
          </motion.div>
        );
      })}
    </div>
  );
}
