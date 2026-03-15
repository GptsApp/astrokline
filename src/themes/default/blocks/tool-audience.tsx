'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '@/shared/types/blocks/landing';
import { cn } from '@/shared/lib/utils';
import { SmartIcon } from '@/shared/blocks/common';

export function ToolAudience({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const tabs = section.tabs || [];
  const [activeTab, setActiveTab] = useState(0);

  if (!tabs.length) return null;

  return (
    <section
      id={section.id || 'audience'}
      className={cn('py-24 bg-[#0A0A0A] relative overflow-hidden', section.className, className)}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Who is <span className="text-primary">{section.highlight_text || 'this tool'}</span> for?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section.description}
            </p>
          </motion.div>
        </div>

        {/* Desktop Tabs / Mobile Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 justify-start md:justify-center mb-12 scroll-smooth pb-4 md:pb-0">
          {tabs.map((tab: any, index: number) => {
            const isActive = activeTab === index;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full text-sm md:text-base font-medium transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,175,55,0.3)]" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
              >
                {tab.icon && <SmartIcon name={tab.icon} className="w-4 h-4" />}
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="relative min-h-[400px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                  <SmartIcon name={tabs[activeTab].icon || "Star"} className="w-5 h-5" />
                  <span className="font-bold">{tabs[activeTab].title}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  {tabs[activeTab].headline}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {tabs[activeTab].description}
                </p>
                
                {tabs[activeTab].benefits && (
                  <ul className="space-y-4 pt-6">
                    {tabs[activeTab].benefits.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 mt-1 flex flex-shrink-0 items-center justify-center">
                          <SmartIcon name="CheckCircle" className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-foreground leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#15131A] aspect-square md:aspect-[4/3] flex items-center justify-center">
                {tabs[activeTab].image ? (
                  <img 
                    src={tabs[activeTab].image.src} 
                    alt={tabs[activeTab].image.alt || tabs[activeTab].title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-12 text-center border-t border-white/5">
                    <SmartIcon name={tabs[activeTab].icon || "Image"} className="w-24 h-24 text-white/5 mb-6" />
                    <p className="text-white/20 font-mono text-sm">{tabs[activeTab].title} Interface Preview...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
