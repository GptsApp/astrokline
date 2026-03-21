'use client';

import { Compass, CornerRightDown, FileDigit, LineChart } from 'lucide-react';

import { useBirthInfoModal } from '@/components/astrokline/ui/birth-info-context';
import { useRouter } from '@/core/i18n/navigation';
import { Section } from '@/shared/types/blocks/landing';

export function HowItWorks({ section }: { section?: Section }) {
  const { open } = useBirthInfoModal();
  const router = useRouter();

  const steps = [
    {
      icon: FileDigit,
      title: '1. Enter Your Birth Data',
      desc: 'Date, time, and birthplace set the chart we calculate from.',
    },
    {
      icon: Compass,
      title: '2. Calculate The Timing',
      desc: 'We score long cycles and transit pressure against your natal chart.',
    },
    {
      icon: LineChart,
      title: '3. Read The Curve',
      desc: 'You get a clear K-Line with stronger years, weaker years, and turning points.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-background relative overflow-hidden py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            {section?.title || 'Three Steps'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {section?.description || 'No astrology background needed.'}
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="via-primary/30 absolute top-12 right-[15%] left-[15%] z-0 hidden h-[1px] bg-gradient-to-r from-transparent to-transparent md:block" />

          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="group relative z-10 flex flex-col items-center text-center"
            >
              <div className="group-hover:border-primary/30 relative mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#111] shadow-[0_0_30px_rgba(212,175,55,0.05)] transition-colors duration-500">
                <div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <step.icon className="text-primary/70 group-hover:text-primary h-10 w-10 transition-colors" />
                <div className="text-primary/30 absolute top-2 right-2 font-mono text-[10px]">
                  {`0${idx + 1}`}
                </div>
              </div>

              <h3 className="text-foreground mb-3 text-xl font-bold">
                {step.title}
              </h3>
              <p className="text-muted-foreground px-4 text-sm leading-relaxed">
                {step.desc}
              </p>

              {idx < steps.length - 1 && (
                <div className="text-primary/30 mt-6 flex justify-center md:hidden">
                  <CornerRightDown className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <button
            type="button"
            onClick={() => open((birthData) => { router.push('/kline'); })}
            className="group border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary relative flex items-center gap-3 rounded-full border px-8 py-3 font-medium shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
          >
            <span>Generate My K-Line</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
