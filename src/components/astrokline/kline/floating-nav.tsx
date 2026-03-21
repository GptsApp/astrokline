'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'Core Profile' },
  { id: 'k-line', label: '10-Year Destiny' },
  { id: 'radar', label: 'Dimension Radar' },
  { id: 'diagnosis', label: 'Cosmic Diagnosis' },
  { id: 'next-30-days', label: 'Micro Focus' },
  { id: 'report-footer', label: 'Final Verdict' },
];

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      // Use middle of screen as the trigger point
      const triggerY = window.scrollY + window.innerHeight / 2;

      let currentSection = 'hero';
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop } = element;
          if (triggerY >= offsetTop) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 flex-col gap-8 lg:flex xl:left-12">
      {/* Decorative vertical line */}
      <div className="absolute top-2 bottom-2 left-[5px] -z-10 w-px bg-white/[0.05]" />

      {SECTIONS.map((section, idx) => {
        const isActive = activeSection === section.id;
        return (
          <button
            type="button"
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="group relative flex items-center gap-4"
          >
            <div
              className={`h-3 w-3 rounded-full border-2 transition-all duration-500 ease-out ${isActive ? 'scale-125 border-[#D4AF37] bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.6)]' : 'border-white/20 bg-[#0A0A0A] group-hover:scale-110 group-hover:border-white/50'}`}
            />

            <div
              className={`pointer-events-none absolute left-6 flex items-center gap-2 whitespace-nowrap transition-all duration-500 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
            >
              <span className="font-mono text-[10px] text-[#D4AF37] opacity-60">
                0{idx + 1}
              </span>
              <span
                className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-white/60'}`}
              >
                {section.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
