'use client';

import { motion } from 'framer-motion';
import { Section } from '@/shared/types/blocks/landing';
import { cn } from '@/shared/lib/utils';
import { SmartIcon } from '@/shared/blocks/common';

export function ToolFeatures({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const features = section.features || [];

  return (
    <section
      id={section.id || 'features'}
      className={cn('py-24 bg-background relative overflow-hidden', section.className, className)}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {section.headline && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                {section.headline}
              </div>
            )}
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {section.description}
              </p>
            )}
          </motion.div>
        </div>

        <div className="space-y-32">
          {features.map((feature: any, index: number) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col gap-12 lg:gap-24 items-center",
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                )}
              >
                {/* Text Side */}
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex-1 space-y-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    {feature.icon ? (
                      <SmartIcon name={feature.icon} className="w-8 h-8 text-primary" />
                    ) : (
                      <div className="text-2xl font-black text-primary/40 leading-none">0{index + 1}</div>
                    )}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {feature.items && (
                    <ul className="space-y-4 pt-4">
                      {feature.items.map((item: any, i: number) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="w-6 h-6 mt-1 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center">
                            <SmartIcon name={item.icon || "Check"} className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{item.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>

                {/* Media/Image Side */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex-1 w-full"
                >
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#15131A] aspect-[4/3] flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                    {feature.image ? (
                      <img 
                        src={feature.image.src} 
                        alt={feature.image.alt || feature.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 mb-4 animate-pulse" />
                        <div className="h-4 w-32 bg-white/5 mx-auto rounded animate-pulse" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
