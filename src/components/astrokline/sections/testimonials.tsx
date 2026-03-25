"use client";

import { motion } from "framer-motion";
import { Star, Compass, BookOpen } from "lucide-react";

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <BookOpen className="w-4 h-4" />
            Built on Tradition. Powered by Precision.
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Standing on the Shoulders of Masters
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AstroKline is rooted in the same principles that have guided professional astrologers for decades — now computed with astronomical-grade precision.
          </p>
          {/* Product facts bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-muted-foreground/70 font-mono">
            <span>Swiss Ephemeris DE431 precision</span>
            <span className="hidden sm:inline">·</span>
            <span>100-year trajectory mapping</span>
            <span className="hidden sm:inline">·</span>
            <span>Free tier available</span>
          </div>
        </div>

        {/* What AstroKline Does Differently */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Compass,
              title: "Timing, Not Fortune-Telling",
              desc: "We map energy cycles and planetary geometry — not vague predictions. Every data point is verifiable."
            },
            {
              icon: Star,
              title: "Your Data, Your Interpretation",
              desc: "We show the math. You decide what it means. No manufactured anxiety, no fear-based upsells."
            },
            {
              icon: BookOpen,
              title: "Transparency First",
              desc: "Built on open astronomical data (NASA JPL DE431). Every calculation can be independently verified."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="text-center flex flex-col items-center space-y-3 p-6 bg-white/[0.02] rounded-2xl border border-white/5"
            >
              <item.icon className="w-6 h-6 text-primary/60" />
              <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Professional Authority Quotes Ribbon (Temporarily hidden for review) */}
      {/* <div className="mt-8 max-w-6xl mx-auto px-6 relative z-10 border-t border-white/5 pt-16">
        <div className="text-center mb-10">
          <h3 className="text-sm font-mono tracking-widest text-primary/50 uppercase">
            Aligned with the Masters
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "There are no bad charts — only charts not yet understood.",
              author: "Rob Hand",
              title: "Author, Planets in Transit"
            },
            {
              quote: "The birth chart is a seed — it shows what can grow, not a prison sentence.",
              author: "Steven Forrest",
              title: "Founder, Evolutionary Astrology"
            },
            {
              quote: "Astrology is a language. If you understand this language, the sky speaks to you.",
              author: "Dane Rudhyar",
              title: "Pioneer of Modern Astrology"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="text-center flex flex-col items-center justify-center space-y-4 p-6 bg-white/[0.02] rounded-2xl border border-white/5"
            >
              <p className="text-sm font-serif italic text-white/50 leading-relaxed">
                &quot;{item.quote}&quot;
              </p>
              <div className="h-[1px] w-8 bg-primary/20" />
              <div>
                <p className="text-xs font-bold text-white/80">{item.author}</p>
                <p className="text-[10px] text-white/30 font-mono mt-1">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
