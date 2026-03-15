'use client';

import { motion } from 'framer-motion';
import { Section } from '@/shared/types/blocks/landing';
import { cn } from '@/shared/lib/utils';
import { SmartIcon } from '@/shared/blocks/common';

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
      className={cn('py-24 bg-background relative overflow-hidden', section.className, className)}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {section.headline && (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <SmartIcon name={(section.icon as string) || "Sparkles"} className="w-4 h-4 mr-2" />
                {section.headline}
              </div>
            )}
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section.description}
            </p>
          </motion.div>
        </div>

        {/* CSS-only infinite marquee */}
        <div className="relative w-[100vw] left-1/2 -content-start -translate-x-1/2 overflow-hidden py-10">
          {/* Edge gradients for smooth fade */}
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
          
          <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] pointer-events-auto px-6">
            {/* Double the items for seamless loop */}
            {[...items, ...items].map((item: any, i: number) => (
              <div
                key={i}
                className="group relative w-[300px] md:w-[450px] aspect-video rounded-3xl overflow-hidden bg-[#15131A] border border-white/5 flex-shrink-0 cursor-pointer shadow-2xl transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:border-primary/30"
              >
                {item.image ? (
                  <img 
                    src={item.image.src} 
                    alt={item.image.alt || item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                    <SmartIcon name="Image" className="w-12 h-12 text-primary/20" />
                  </div>
                )}
                
                {/* Overlay Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-white/70 text-sm line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
