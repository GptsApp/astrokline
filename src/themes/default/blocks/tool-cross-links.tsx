'use client';

import { motion } from 'framer-motion';
import { Sparkles, LineChart, Heart, ArrowRight } from 'lucide-react';
import { Section } from '@/shared/types/blocks/landing';
import { cn } from '@/shared/lib/utils';
import { Link } from '@/core/i18n/navigation';

export function ToolCrossLinks({
  section,
  className,
}: {
  section?: Section;
  className?: string;
}) {
  const tools = [
    {
      id: 'kline',
      title: 'Destiny K-Line',
      description: 'Transform your natal chart into a real-time destiny K-Line map.',
      icon: LineChart,
      href: '/kline',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'daily',
      title: 'Daily Horoscope',
      description: 'AI-powered daily cosmic guidance based on exact planetary transits.',
      icon: Sparkles,
      href: '/daily',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
    },
    // Ideal Partner hidden until Phase 2 launch
     // {
    //   id: 'ideal-partner',
    //   title: 'Cosmic Soulmate',
    //   description: 'Generate your astrologically ideal partner profile.',
    //   icon: 'Heart',
    //   href: '/ideal-partner',
    //   color: 'from-pink-500/20 to-rose-500/20',
    //   iconColor: 'text-pink-400'
    // }// },
  ];

  return (
    <section
      id={section?.id || 'cross-links'}
      className={cn('py-24 bg-background relative overflow-hidden', section?.className, className)}
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Explore Our <span className="text-primary">Advanced AI Tools</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section?.description || 'Unlock the full potential of your cosmic blueprint with our suite of precision astrology tools.'}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={tool.href}
                  className="group block relative h-full bg-[#15131A] border border-white/5 hover:border-white/20 rounded-3xl p-8 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden"
                >
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-[50px] opacity-40 group-hover:opacity-80 transition-opacity",
                      tool.color
                    )}
                  />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <Icon className={cn("w-6 h-6", tool.iconColor)} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{tool.title}</h3>
                    <p className="text-muted-foreground mb-8 flex-grow">{tool.description}</p>
                    <div className="flex items-center text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors mt-auto">
                      Try Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
