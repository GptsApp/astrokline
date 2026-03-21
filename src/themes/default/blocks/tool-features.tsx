'use client';

import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

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
            {section.headline && (
              <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
                {section.headline}
              </div>
            )}
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
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
                  'flex flex-col items-center gap-12 lg:gap-24',
                  isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
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
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    {feature.icon ? (
                      <SmartIcon
                        name={feature.icon}
                        className="text-primary h-8 w-8"
                      />
                    ) : (
                      <div className="text-primary/40 text-2xl leading-none font-black">
                        0{index + 1}
                      </div>
                    )}
                  </div>
                  <h3 className="text-foreground text-3xl font-bold md:text-4xl">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {feature.items && (
                    <ul className="space-y-4 pt-4">
                      {feature.items.map((item: any, i: number) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="bg-primary/20 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                            <SmartIcon
                              name={item.icon || 'Check'}
                              className="text-primary h-3.5 w-3.5"
                            />
                          </div>
                          <div>
                            <h4 className="text-foreground font-bold">
                              {item.title}
                            </h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {item.description}
                            </p>
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
                  className="w-full flex-1"
                >
                  <div className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#15131A] shadow-2xl">
                    <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-50" />
                    {feature.image ? (
                      <img
                        src={feature.image.src}
                        alt={feature.image.alt || feature.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <div className="mx-auto mb-4 h-20 w-20 animate-pulse rounded-full bg-white/5" />
                        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-white/5" />
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
