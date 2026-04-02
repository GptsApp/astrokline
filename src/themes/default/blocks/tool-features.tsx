import Image from 'next/image';

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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
            {section.headline && (
              <div className="bg-primary/10 text-primary mb-6 inline-flex items-center px-4 py-2 text-sm font-medium">
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
          </div>
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
                <div
                  className={cn(
                    "flex-1 space-y-8 animate-in fade-in duration-700 fill-mode-both",
                    isReversed ? "slide-in-from-right-12" : "slide-in-from-left-12"
                  )}
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center  border border-white/10 bg-white/5">
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
                          <div className="bg-primary/20 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center">
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
                </div>

                {/* Media/Image Side */}
                <div
                  className="w-full flex-1 animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden  border border-white/10 bg-[#15131A] shadow-2xl">
                    <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-50" />
                    {feature.image ? (
                      <Image
                        src={feature.image.src}
                        alt={feature.image.alt || feature.title}
                        width={800}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <div className="mx-auto mb-4 h-20 w-20 animate-pulse bg-white/5" />
                        <div className="mx-auto h-4 w-32 animate-pulse  bg-white/5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
