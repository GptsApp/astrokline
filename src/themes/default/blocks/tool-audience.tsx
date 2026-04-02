'use client';

import { useState } from 'react';
import Image from 'next/image';

import { SmartIcon } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

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
      className={cn(
        'relative overflow-hidden bg-[#0A0A0A] py-24',
        section.className,
        className
      )}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              Who is{' '}
              <span className="text-primary">
                {section.highlight_text || 'this tool'}
              </span>{' '}
              for?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {section.description}
            </p>
          </div>
        </div>

        {/* Desktop Tabs / Mobile Scroll */}
        <div className="hide-scrollbar mb-12 flex justify-start gap-4 overflow-x-auto scroll-smooth pb-4 md:justify-center md:pb-0">
          {tabs.map((tab: any, index: number) => {
            const isActive = activeTab === index;
            return (
              <button
                type="button"
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-all md:text-base',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                    : 'text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10'
                )}
              >
                {tab.icon && <SmartIcon name={tab.icon} className="h-4 w-4" />}
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="relative min-h-[400px] w-full">
          <div
            key={activeTab}
            className="absolute inset-0 grid grid-cols-1 items-center gap-12 md:grid-cols-2 animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="space-y-6">
              <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 px-4 py-2">
                <SmartIcon
                  name={tabs[activeTab].icon || 'Star'}
                  className="h-5 w-5"
                />
                <span className="font-bold">{tabs[activeTab].title}</span>
              </div>
              <h3 className="text-foreground text-3xl font-bold md:text-4xl">
                {tabs[activeTab].headline}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {tabs[activeTab].description}
              </p>

              {tabs[activeTab].benefits && (
                <ul className="space-y-4 pt-6">
                  {tabs[activeTab].benefits.map(
                    (benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center">
                          <SmartIcon
                            name="CheckCircle"
                            className="text-primary h-5 w-5"
                          />
                        </div>
                        <span className="text-foreground leading-relaxed">
                          {benefit}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            <div className="relative flex aspect-square items-center justify-center overflow-hidden  border border-white/10 bg-[#15131A] shadow-2xl md:aspect-[4/3]">
              {tabs[activeTab].image ? (
                <Image
                  src={tabs[activeTab].image.src}
                  alt={tabs[activeTab].image.alt || tabs[activeTab].title}
                  width={500}
                  height={375}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center border-t border-white/5 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-12 text-center">
                  <SmartIcon
                    name={tabs[activeTab].icon || 'Image'}
                    className="mb-6 h-24 w-24 text-white/5"
                  />
                  <p className="font-mono text-sm text-white/20">
                    {tabs[activeTab].title} Interface Preview...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
