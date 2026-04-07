'use client';

import { motion } from 'framer-motion';
import { ArrowRight, LineChart } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

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
      title: 'Life Curve',
      description:
        'Turn your birth-chart data into a personal timing map.',
      icon: LineChart,
      href: '/kline',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400',
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
      className={cn(
        'bg-background relative overflow-hidden py-24',
        section?.className,
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Explore our{' '}
              <span className="text-primary">Advanced AI Tools</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {section?.description ||
                'Use focused tools for timing, deeper interpretation, and personal insight.'}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                  className="group relative block h-full overflow-hidden  border border-white/5 bg-[#15131A] p-8 transition-all hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                >
                  <div
                    className={cn(
                      'absolute top-0 right-0 h-32 w-32 bg-gradient-to-br opacity-40 blur-[50px] transition-opacity group-hover:opacity-80',
                      tool.color
                    )}
                  />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center  border border-white/10 bg-white/5">
                      <Icon className={cn('h-6 w-6', tool.iconColor)} />
                    </div>
                    <h3 className="text-foreground mb-3 text-xl font-bold">
                      {tool.title}
                    </h3>
                    <p className="text-muted-foreground mb-8 flex-grow">
                      {tool.description}
                    </p>
                    <div className="text-foreground/80 group-hover:text-foreground mt-auto flex items-center text-sm font-bold transition-colors">
                      Try Now{' '}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
