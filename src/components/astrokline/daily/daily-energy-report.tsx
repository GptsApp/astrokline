"use client";

import { motion } from "framer-motion";
import { Heart, Briefcase, Coins, Activity, Sparkles, Navigation, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ReportSection } from "@/components/astrokline/kline/report-section";

/* ─── Mock Data ─── */
const DIMENSIONS = [
  {
    id: "love",
    label: "Love & Connections",
    icon: Heart,
    score: 92,
    accent: "text-pink-400",
    barColor: "bg-pink-500",
    status: "GREEN" as const,
    transit: "Venus 120° Mars",
    theme: "Magnetic Attraction",
    summary: "Your aura is exceptionally charismatic today. A powerful trine between Venus and Mars activates your relationship sector, making this an ideal time for deep connections.",
    guidance: "Express your feelings openly but avoid rushing commitments. A surprise encounter around evening could be significant.",
  },
  {
    id: "career",
    label: "Career & Ambition",
    icon: Briefcase,
    score: 85,
    accent: "text-blue-400",
    barColor: "bg-blue-500",
    status: "GREEN" as const,
    transit: "Mercury in 10th House",
    theme: "Strategic Visibility",
    summary: "Professional communication flows effortlessly. With Mercury illuminating your career zone, superiors are highly receptive to your innovative ideas.",
    guidance: "Pitch that concept you've been working on. Schedule important meetings before 3 PM for maximum impact.",
  },
  {
    id: "wealth",
    label: "Wealth & Assets",
    icon: Coins,
    score: 45,
    accent: "text-emerald-400",
    barColor: "bg-emerald-500",
    status: "RED" as const,
    transit: "Saturn □ Sun",
    theme: "Financial Prudence",
    summary: "Cosmic weather demands strict financial discipline today. Saturn's restrictive influence suggests delays in expected returns or unexpected necessary expenses.",
    guidance: "Halt all speculative investments. Focus instead on budgeting, reviewing subscriptions, and long-term asset structuring.",
  },
  {
    id: "health",
    label: "Physical & Mental Vitality",
    icon: Activity,
    score: 70,
    accent: "text-purple-400",
    barColor: "bg-purple-500",
    status: "AMBER" as const,
    transit: "Moon □ Neptune",
    theme: "Energy Conservation",
    summary: "Physical stamina is adequate, but mental fog is highly likely due to Neptunian haze. Your empathic output may drain your core reserves today.",
    guidance: "Prioritize grounding exercises like walking in nature. Swap high-intensity interval training for restorative yoga or meditation.",
  },
];

const STATUS_STYLES = {
  GREEN: { dot: "bg-emerald-500 shadow-emerald-500/50", text: "text-emerald-400" },
  AMBER: { dot: "bg-amber-500 shadow-amber-500/50", text: "text-amber-400" },
  RED:   { dot: "bg-red-500 shadow-red-500/50", text: "text-red-400" },
};

function formatDate(date: Date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return {
    full: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    day: days[date.getDay()],
  };
}

export function DailyEnergyReport() {
  const today = new Date();
  const { full, day } = formatDate(today);
  const overallScore = Math.round(DIMENSIONS.reduce((s, d) => s + d.score, 0) / DIMENSIONS.length);

  return (
    <div className="w-full">
      {/* ── Calendar Header ── */}
      <div className="bg-[#111015] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
          <div className="flex items-center justify-between">
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-white/90 tracking-tight">
                {full}
              </h1>
              <p className="text-xs font-mono text-white/40 mt-0.5">{day}</p>
            </div>

            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Moon phase mini-bar */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <Moon className="w-3.5 h-3.5 text-indigo-400/60" />
            <span className="text-[11px] font-mono text-white/40">
              Waning Gibbous · Moon in Scorpio · 78% illuminated
            </span>
          </div>
        </div>
      </div>

      {/* ── Overall Score ── */}
      <ReportSection id="overall" divider={false} className="pt-6 pb-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className={cn(
              "text-4xl font-bold font-mono",
              overallScore >= 75 ? "text-primary" : overallScore >= 50 ? "text-white/80" : "text-rose-400"
            )}>
              {overallScore}
            </span>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Overall</span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">
              Today&apos;s Cosmic Weather
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              A day of contrasts — exceptional interpersonal magnetism paired with financial caution. Channel energy into relationships and career visibility while protecting your reserves.
            </p>
          </div>
        </div>
      </ReportSection>

      {/* ── Four Dimensions ── */}
      {DIMENSIONS.map((dim, idx) => {
        const Icon = dim.icon;
        const status = STATUS_STYLES[dim.status];
        return (
          <ReportSection key={dim.id} id={dim.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Dimension Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center", dim.accent)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white/90">{dim.label}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary/50" />
                      <span className="text-[10px] font-mono text-white/35">{dim.transit}</span>
                      <span className="text-white/10">·</span>
                      <span className={cn("text-[10px] font-mono", dim.accent)}>{dim.theme}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status dot */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/5">
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_6px]", status.dot)} />
                    <span className={cn("text-[9px] font-bold tracking-wider", status.text)}>{dim.status}</span>
                  </div>
                  {/* Score */}
                  <span className={cn(
                    "text-2xl font-bold font-mono",
                    dim.score >= 75 ? "text-primary" : dim.score >= 50 ? "text-white/70" : "text-rose-400"
                  )}>
                    {dim.score}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${dim.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={cn("h-full rounded-full", dim.barColor)}
                  style={{ opacity: 0.7 }}
                />
              </div>

              {/* Summary */}
              <p className="text-sm text-white/60 leading-relaxed mb-4">{dim.summary}</p>

              {/* Guidance */}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Navigation className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                <p className="text-sm text-white/80 leading-relaxed">
                  <span className="text-primary/70 font-medium mr-1">Guidance:</span>
                  {dim.guidance}
                </p>
              </div>
            </motion.div>
          </ReportSection>
        );
      })}
    </div>
  );
}
