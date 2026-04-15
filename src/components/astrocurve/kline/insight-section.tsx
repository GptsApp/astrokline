'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { Heading } from '@/components/astrocurve/ui/heading';

// Reusable text parser for AI insight content
const AstroTextParser = ({ text }: { text: string }) => {
  if (!text) return null;
  const normalized = text.replace(/\\n/g, '\n');
  const lines = normalized.split('\n');

  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('- ')) {
          const content = trimmed.slice(2);
          return (
            <div key={i} className="relative flex gap-2 text-[15px] leading-relaxed text-white/70">
              <span className="text-primary mt-1.5">•</span>
              <p>{renderInlineStyle(content)}</p>
            </div>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-8 whitespace-pre-wrap text-white/70">
            {renderInlineStyle(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineStyle(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="border-primary/30 border-b pb-[1px] font-bold tracking-wide text-white" style={{ textShadow: '0 0 10px rgba(139,92,246,0.3)' }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <span key={i} className="text-primary/80 italic">{part.slice(1, -1)}</span>;
    }
    return part;
  });
}

interface InsightSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  text: string;
  iconColor: string; // e.g. "blue", "emerald", "rose"
}

export function InsightSection({ icon: Icon, title, subtitle, text, iconColor }: InsightSectionProps) {
  const colorMap: Record<string, { border: string; bg: string; text: string; shadow: string; subtitleText: string }> = {
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]', subtitleText: 'text-blue-400/50' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]', subtitleText: 'text-emerald-400/50' },
    rose: { border: 'border-rose-500/20', bg: 'bg-rose-500/10', text: 'text-rose-400', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]', subtitleText: 'text-rose-400/50' },
    teal: { border: 'border-teal-500/20', bg: 'bg-teal-500/10', text: 'text-teal-400', shadow: 'shadow-[0_0_20px_rgba(20,184,166,0.1)]', subtitleText: 'text-teal-400/50' },
    amber: { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]', subtitleText: 'text-amber-500/50' },
    primary: { border: 'border-primary/20', bg: 'bg-primary/10', text: 'text-primary', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.1)]', subtitleText: 'text-primary/50' },
  };

  const c = colorMap[iconColor] || colorMap.primary;

  return (
    <>
      <div className="border-t border-white/5" />
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center border ${c.border} ${c.bg} ${c.shadow}`}>
            <Icon className={`h-5 w-5 ${c.text}`} />
          </div>
          <div>
            <Heading level={2} variant="card" className="text-xl text-white/90">
              {title}
            </Heading>
            <p className={`mt-1 font-mono text-[11px] tracking-[0.2em] uppercase ${c.subtitleText}`}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className="pl-[52px]">
          <AstroTextParser text={text} />
        </div>
      </motion.section>
    </>
  );
}

export { AstroTextParser };
