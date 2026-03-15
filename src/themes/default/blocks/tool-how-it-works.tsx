'use client';

import { motion } from 'framer-motion';
import { Section } from '@/shared/types/blocks/landing';
import { cn } from '@/shared/lib/utils';
import { SmartIcon } from '@/shared/blocks/common';

export function ToolHowItWorks({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const steps = section.steps || [
    { title: "Step 1", description: "Default description", icon: "Settings" },
    { title: "Step 2", description: "Default description", icon: "Sparkles" },
    { title: "Step 3", description: "Default description", icon: "CheckCircle" },
  ];

  return (
    <section
      id={section.id || 'how-it-works'}
      className={cn('py-24 bg-background relative overflow-hidden', section.className, className)}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {section.title || "How to use"} <span className="text-primary">{section.highlight_text}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section.description}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

          {steps.map((step: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-[120px] h-[120px] rounded-full bg-[#15131A] border border-white/10 shadow-xl flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-primary/40 to-transparent opacity-0 group-hover:opacity-100 blur-[10px] transition-opacity duration-500" />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  {step.icon ? (
                    <SmartIcon name={step.icon} className="w-8 h-8 text-primary" />
                  ) : (
                    <span className="text-2xl font-black text-primary">{index + 1}</span>
                  )}
                </div>
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-[0_4px_10px_rgba(212,175,55,0.4)]">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed break-words">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
