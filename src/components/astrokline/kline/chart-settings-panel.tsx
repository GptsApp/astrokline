'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Info, Settings2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface ChartSettingsProps {
  className?: string;
}

export function ChartSettingsPanel({ className }: ChartSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zodiac, setZodiac] = useState('Tropical');
  const [houseSystem, setHouseSystem] = useState('Placidus');
  const [orbs, setOrbs] = useState('Default');

  return (
    <div
      className={cn(
        'w-full border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-3 font-mono text-xs font-medium text-white/50 transition-colors hover:text-white/80"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>Chart Settings</span>
          <span className="px-1 text-white/20">•</span>
          <span className="text-primary/70">{zodiac}</span>
          <span className="text-white/20">/</span>
          <span className="text-primary/70">{houseSystem}</span>
          <span className="text-white/20">/</span>
          <span className="text-primary/70">{orbs} Orbs</span>

          <ChevronDown
            className={cn(
              'ml-1 h-3.5 w-3.5 transition-transform duration-300',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Expandable Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-6 border-t border-white/5 py-4 md:grid-cols-3">
                {/* Zodiac System */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold tracking-widest text-white/70 uppercase">
                      Zodiac System
                    </label>
                    <Info className="h-3 w-3 cursor-help text-white/30" />
                  </div>
                  <div className="flex rounded-lg bg-white/5 p-1">
                    {['Tropical', 'Sidereal'].map((sys) => (
                      <button
                        type="button"
                        key={sys}
                        onClick={() => setZodiac(sys)}
                        className={cn(
                          'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                          zodiac === sys
                            ? 'border border-[#D4AF37]/30 bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                        )}
                      >
                        {sys}
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-white/30">
                    Tropical (Seasonal) vs. Sidereal (Constellational)
                  </p>
                </div>

                {/* House System */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold tracking-widest text-white/70 uppercase">
                      House System
                    </label>
                    <Info className="h-3 w-3 cursor-help text-white/30" />
                  </div>
                  <div className="flex rounded-lg bg-white/5 p-1">
                    {['Placidus', 'Whole Sign', 'Koch'].map((sys) => (
                      <button
                        type="button"
                        key={sys}
                        onClick={() => setHouseSystem(sys)}
                        className={cn(
                          'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                          houseSystem === sys
                            ? 'border border-[#D4AF37]/30 bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                        )}
                      >
                        {sys}
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-white/30">
                    Algorithm for dividing the sky into 12 sectors.
                  </p>
                </div>

                {/* Aspect Orbs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold tracking-widest text-white/70 uppercase">
                      Aspect Orbs
                    </label>
                    <Info className="h-3 w-3 cursor-help text-white/30" />
                  </div>
                  <div className="flex rounded-lg bg-white/5 p-1">
                    {['Strict', 'Default', 'Wide'].map((sys) => (
                      <button
                        type="button"
                        key={sys}
                        onClick={() => setOrbs(sys)}
                        className={cn(
                          'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                          orbs === sys
                            ? 'border border-[#D4AF37]/30 bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                        )}
                      >
                        {sys}
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-white/30">
                    Tolerance range for angular planetary connections.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
