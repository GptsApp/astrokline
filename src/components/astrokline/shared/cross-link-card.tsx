"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CrossLinkCardProps {
  /** "daily" or "kline" */
  target: "daily" | "kline";
  className?: string;
}

export function CrossLinkCard({ target, className }: CrossLinkCardProps) {
  const isDaily = target === "daily";
  
  return (
    <motion.a
      href={isDaily ? "/daily" : "/kline"}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group block w-full rounded-2xl bg-[#111015] border border-white/5 hover:border-primary/20 p-5 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          {isDaily ? (
            <Calendar className="w-4 h-4 text-primary" />
          ) : (
            <TrendingUp className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
            {isDaily
              ? "Your daily cosmic weather is ready"
              : "Want the full 10-year picture?"}
          </h4>
          <p className="text-xs text-white/40 mt-0.5">
            {isDaily
              ? "See today's energy alignment for Love, Career, Wealth & Health."
              : "Map your destiny peaks, valleys, and turning points with your K-Line."}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </motion.a>
  );
}
