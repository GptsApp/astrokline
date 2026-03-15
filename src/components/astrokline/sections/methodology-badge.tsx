"use client";

import { motion } from "framer-motion";
import { Database, Compass, LayoutGrid, Target, Clock, MapPin } from "lucide-react";

const methodItems = [
  {
    icon: Database,
    label: "Swiss Ephemeris",
    detail: "Arcsecond-precision planetary positions (DE431)",
  },
  {
    icon: Compass,
    label: "Tropical Zodiac",
    detail: "Western standard, season-aligned system",
  },
  {
    icon: LayoutGrid,
    label: "Placidus Houses",
    detail: "Most widely adopted house system globally",
  },
  {
    icon: Target,
    label: "Applying / Separating",
    detail: "Full aspect phase distinction with configurable orbs",
  },
  {
    icon: Clock,
    label: "DST-Aware",
    detail: "Full historical timezone & daylight saving support",
  },
  {
    icon: MapPin,
    label: "GPS-Precise",
    detail: "Geocentric calculation with exact birth coordinates",
  },
];

export function MethodologyBadge() {
  return (
    <section id="methodology" className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70 font-mono mb-3">
            Built on Real Astronomy
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Professional-Grade <span className="text-primary">Methodology.</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            AstroKline uses the same astronomical engine trusted by professional astrologers worldwide.
            Every calculation is transparent, precise, and verifiable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {methodItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="group relative rounded-2xl border border-white/5 bg-[#15131A] p-5 hover:border-primary/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white/90 mb-1">{item.label}</h3>
                  <p className="text-[11px] text-white/40 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Authority Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-white/20 font-mono tracking-wider">
            Aligned with OPA & ISAR professional standards
          </p>
        </motion.div>
      </div>
    </section>
  );
}
