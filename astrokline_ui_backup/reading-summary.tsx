'use client';

import { Heading } from "@/components/astrocurve/ui/heading";

import { DestinyReading } from '@/lib/astrocurve/mock-astrology-data';
import { motion } from 'framer-motion';
import {
  ArrowRightCircle,
  Brain,
  Clock,
  Eye,
  Heart,
  Hourglass,
  Layers,
  Leaf,
  Shield,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react';

interface CoreInsight {
  tag: string;
  text: string;
  match: number;
}

interface ExtendedReading extends DestinyReading {
  advice: DestinyReading['advice'] & {
    health?: string;
    timing?: string;
  };
  hiddenTalent?: {
    title: string;
    description: string;
    activationAdvice: string;
  };
  coreInsights?: CoreInsight[];
  cosmicQuote?: string;
}

interface Props {
  reading: ExtendedReading;
}

const tagIcons: Record<string, typeof Brain> = {
  'Core Pattern': Brain,
  'Hidden Gift': Eye,
  'Shadow Pattern': Heart,
  'Strategic Edge': Target,
  'Body Wisdom': Leaf,
};

export function ReadingSummary({ reading }: Props) {
  const insights: CoreInsight[] = reading.coreInsights || [];
  const cosmicQuote =
    reading.cosmicQuote ||
    'You are not behind. You are precisely where a builder needs to be before their defining decade begins.';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 md:px-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-[#D4AF37]" />
        <Heading level={2} className="font-serif text-2xl tracking-tight text-white/90">
          Cosmic Diagnosis
        </Heading>
        <div className="ml-4 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* ── HERO QUOTE ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden  border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-purple-500/5 px-6 py-8"
      >
        <div className="absolute top-4 left-6 font-serif text-5xl leading-none text-[#D4AF37]/10">
          &ldquo;
        </div>
        <div className="absolute right-6 bottom-4 font-serif text-5xl leading-none text-[#D4AF37]/10">
          &rdquo;
        </div>
        <div className="pointer-events-none absolute top-0 right-0 h-[200px] w-[200px] bg-[#D4AF37]/5 blur-[80px]" />

        <blockquote className="relative z-10 mx-auto max-w-3xl text-center font-serif text-lg leading-relaxed text-white/90 md:text-xl">
          {cosmicQuote}
        </blockquote>
        <p className="relative z-10 mt-3 text-center font-mono text-[10px] tracking-widest text-[#D4AF37] uppercase">
          Your Cosmic Truth
        </p>
      </motion.div>

      {/* ── PERSONAL INSIGHTS with match% ── */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-400" />
            <Heading level={3} className="font-serif text-base text-white/80">
              What The Stars See In You
            </Heading>
            <span className="ml-auto font-mono text-[9px] tracking-widest text-white/25 uppercase">
              AI Precision
            </span>
          </div>

          {insights.map((insight, idx) => {
            const Icon = tagIcons[insight.tag] || Star;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group flex gap-3  border border-white/5 bg-[#111015] p-4 transition-all hover:border-white/10"
              >
                <div className="mt-0.5 shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 transition-colors group-hover:border-[#D4AF37]/30">
                    <Icon className="h-4 w-4 text-white/40 transition-colors group-hover:text-[#D4AF37]" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold tracking-widest text-purple-400/80 uppercase">
                    {insight.tag}
                  </span>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                    {insight.text}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-center justify-center gap-0.5">
                  <span className="font-mono text-base leading-none font-bold text-[#D4AF37]">
                    {insight.match}%
                  </span>
                  <span className="text-[7px] tracking-widest text-white/25 uppercase">
                    match
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── HIDDEN TALENT ── */}
      {reading.hiddenTalent && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden  border border-purple-500/15 bg-gradient-to-br from-purple-500/5 to-transparent p-5"
        >
          <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 bg-purple-500/10 blur-[60px]" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                Hidden Talent
              </span>
            </div>
            <Heading level={4} className="mb-2 font-serif text-lg text-white/90">
              {reading.hiddenTalent.title}
            </Heading>
            <p className="mb-3 text-sm leading-relaxed text-white/60">
              {reading.hiddenTalent.description}
            </p>
            <div className=" border border-purple-500/10 bg-purple-500/5 px-4 py-3">
              <p className="mb-1 text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                How to Activate
              </p>
              <p className="text-sm leading-relaxed text-white/80">
                {reading.hiddenTalent.activationAdvice}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3-CARD DIAGNOSIS ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Structure */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden  border border-white/5 bg-[#111015] p-5 shadow-xl"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-yellow-500/5 blur-[40px] transition-colors group-hover:bg-yellow-500/10" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <Layers className="h-5 w-5 text-white/50" />
              <span className="-full bg-[#D4AF37]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase">
                01
              </span>
            </div>
            <Heading level={3} className="mb-1 font-serif text-lg text-white/90">
              {reading.structure.title}
            </Heading>
            <div className="mb-3 font-mono text-[10px] text-[#D4AF37]">
              {reading.structure.element}
            </div>
            <p className="mb-4 flex-1 text-xs leading-relaxed text-white/60">
              {reading.structure.description}
            </p>
            <div className="border-t border-white/5 pt-3">
              <p className="mb-0.5 text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                Core Vulnerability
              </p>
              <p className="text-xs text-white/80">
                {reading.structure.coreChallenge}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Phase */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="group relative overflow-hidden  border border-white/5 bg-[#111015] p-5 shadow-xl"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 blur-[40px] transition-colors group-hover:bg-blue-500/10" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <Hourglass className="h-5 w-5 text-white/50" />
              <span className="-full bg-[#3B82F6]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#3B82F6] uppercase">
                02
              </span>
            </div>
            <Heading level={3} className="mb-3 font-serif text-lg text-white/90">
              {reading.phase.title}
            </Heading>
            <div className="flex-1 space-y-3">
              <div>
                <p className="mb-0.5 text-[10px] font-bold tracking-wider text-white/35 uppercase">
                  Why you feel stuck
                </p>
                <p className="text-xs leading-relaxed text-white/60">
                  {reading.phase.whyStuck}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2 border-t border-white/5 pt-4">
              <div>
                <p className="mb-0.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  Turning Point
                </p>
                <p className="text-xs font-bold text-white">
                  {reading.phase.turningPoint}
                </p>
              </div>
              <div className="h-1 w-full overflow-hidden bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${reading.phase.momentum}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-white/35">
                <span>Momentum</span>
                <span>{reading.phase.momentum}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action — with health + timing */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="group relative overflow-hidden  border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-5 shadow-xl"
        >
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#D4AF37]/10 blur-[50px] transition-transform duration-700 group-hover:scale-110" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <ArrowRightCircle className="h-5 w-5 text-[#D4AF37]" />
              <span className="-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-bold tracking-widest text-black uppercase shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                03
              </span>
            </div>
            <Heading level={3} className="mb-4 font-serif text-lg text-white/90">
              Strategic Directives
            </Heading>
            <div className="flex-1 space-y-3">
              <AdviceItem
                icon={Zap}
                label="Career"
                color="text-rose-400"
                text={reading.advice.career}
              />
              <AdviceItem
                icon={Shield}
                label="Wealth"
                color="text-emerald-400"
                text={reading.advice.wealth}
              />
              <AdviceItem
                icon={Heart}
                label="Relationships"
                color="text-blue-400"
                text={reading.advice.relationships}
              />
              {reading.advice.health && (
                <AdviceItem
                  icon={Leaf}
                  label="Health"
                  color="text-teal-400"
                  text={reading.advice.health}
                />
              )}
              {reading.advice.timing && (
                <AdviceItem
                  icon={Clock}
                  label="Timing"
                  color="text-[#D4AF37]"
                  text={reading.advice.timing}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdviceItem({
  icon: Icon,
  label,
  color,
  text,
}: {
  icon: typeof Zap;
  label: string;
  color: string;
  text: string;
}) {
  return (
    <div className="flex gap-2">
      <div className="mt-0.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <div>
        <p className="mb-0.5 text-[10px] font-bold tracking-wider text-white/50 uppercase">
          {label}
        </p>
        <p className="text-xs leading-relaxed text-white/80">{text}</p>
      </div>
    </div>
  );
}
