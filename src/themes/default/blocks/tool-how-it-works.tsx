'use client';

import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ToolHowItWorks({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const steps = section.steps || [
    { title: 'Step 1', description: 'Default description', icon: 'Settings' },
    { title: 'Step 2', description: 'Default description', icon: 'Sparkles' },
    {
      title: 'Step 3',
      description: 'Default description',
      icon: 'CheckCircle',
    },
  ];

  return (
    <section
      id={section.id || 'how-it-works'}
      className={cn(
        'bg-background relative overflow-hidden py-24',
        section.className,
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              {section.title || 'How to use'}{' '}
              <span className="text-primary">{section.highlight_text}</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {section.description}
            </p>
          </motion.div>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {/* Connector Line (Desktop only) */}
          <div className="via-primary/30 absolute top-[60px] right-[15%] left-[15%] z-0 hidden h-[1px] bg-gradient-to-r from-transparent to-transparent md:block" />

          {steps.map((step: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="group relative mb-8 flex h-[120px] w-[120px] items-center justify-center border border-white/10 bg-[#15131A] shadow-xl">
                <div className="from-primary/40 absolute inset-[-4px] bg-gradient-to-br to-transparent opacity-0 blur-[10px] transition-opacity duration-500 group-hover:opacity-100" />
                <div className="bg-primary/10 border-primary/20 flex h-16 w-16 items-center justify-center border">
                  {step.icon ? (
                    <SmartIcon
                      name={step.icon}
                      className="text-primary h-8 w-8"
                    />
                  ) : (
                    <span className="text-primary text-2xl font-black">
                      {index + 1}
                    </span>
                  )}
                </div>
                {/* Step number badge */}
                <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center text-sm font-bold shadow-[0_4px_10px_rgba(212,175,55,0.4)]">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-foreground mb-4 text-2xl font-bold">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed break-words">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
