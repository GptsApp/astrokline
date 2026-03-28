'use client';

import { motion } from 'framer-motion';

import { SmartIcon } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ToolShowcase({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const items = section.items || [];

  if (!items.length) return null;

  return (
    <section
      id={section.id || 'showcase'}
      className={cn(
        'bg-background relative overflow-hidden py-24',
        section.className,
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {section.headline && (
              <div className="bg-primary/10 text-primary mb-6 inline-flex items-center px-4 py-2 text-sm font-medium">
                <SmartIcon
                  name={(section.icon as string) || 'Sparkles'}
                  className="mr-2 h-4 w-4"
                />
                {section.headline}
              </div>
            )}
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {section.description}
            </p>
          </motion.div>
        </div>

        {/* CSS-only infinite marquee */}
        <div className="-content-start relative left-1/2 w-[100vw] -translate-x-1/2 overflow-hidden py-10">
          {/* Edge gradients for smooth fade */}
          <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-20 w-32 bg-gradient-to-r to-transparent" />
          <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-20 w-32 bg-gradient-to-l to-transparent" />

          <div className="animate-marquee pointer-events-auto flex w-max gap-6 px-6 hover:[animation-play-state:paused]">
            {/* Double the items for seamless loop */}
            {[...items, ...items].map((item: any, i: number) => (
              <div
                key={i}
                className="group hover:border-primary/30 relative aspect-video w-[300px] flex-shrink-0 cursor-pointer overflow-hidden  border border-white/5 bg-[#15131A] shadow-2xl transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] md:w-[450px]"
              >
                {item.image ? (
                  <img
                    src={item.image.src}
                    alt={item.image.alt || item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="from-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-br to-transparent">
                    <SmartIcon
                      name="Image"
                      className="text-primary/20 h-12 w-12"
                    />
                  </div>
                )}

                {/* Overlay Text */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <h3 className="mb-1 text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-white/70">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
