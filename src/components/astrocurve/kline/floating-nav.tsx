'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ZodiacIcon, PlanetIcon } from '@/components/icons';

interface FloatingNavProps {
  variant?: 'sticky' | 'submenu';
}

const SECTIONS = [
  { id: 'destiny-kline', icon: 'curve' as const },
  { id: 'past-proof', icon: 'proof' as const },
  { id: 'cosmic-profile', icon: 'profile' as const },
  { id: 'deep-reading', icon: 'reading' as const },
  { id: 'action-map', icon: 'action' as const },
  { id: 'unlock', icon: 'unlock' as const },
];

const NAV_COPY = {
  en: {
    'destiny-kline': { label: 'Destiny K-Line', shortLabel: 'K-Line' },
    'past-proof': { label: 'Past Proof', shortLabel: 'Proof' },
    'cosmic-profile': { label: 'Cosmic Profile', shortLabel: 'Profile' },
    'deep-reading': { label: 'Deep Reading', shortLabel: 'Reading' },
    'action-map': { label: 'Action Map', shortLabel: 'Action' },
    unlock: { label: 'Unlock', shortLabel: 'Unlock' },
  },
  ja: {
    'destiny-kline': { label: '命運K線', shortLabel: 'K線' },
    'past-proof': { label: '過去の検証', shortLabel: '検証' },
    'cosmic-profile': { label: 'コズミック・プロフ', shortLabel: 'プロフ' },
    'deep-reading': { label: '深層リーディング', shortLabel: '深層' },
    'action-map': { label: '行動マップ', shortLabel: '行動' },
    unlock: { label: '解放する', shortLabel: '解放' },
  },
  es: {
    'destiny-kline': { label: 'K-Line del Destino', shortLabel: 'K-Line' },
    'past-proof': { label: 'Prueba del Pasado', shortLabel: 'Prueba' },
    'cosmic-profile': { label: 'Perfil Cósmico', shortLabel: 'Perfil' },
    'deep-reading': { label: 'Lectura Profunda', shortLabel: 'Lectura' },
    'action-map': { label: 'Mapa de Acción', shortLabel: 'Acción' },
    unlock: { label: 'Desbloquear', shortLabel: 'Más' },
  },
} as const;

/** Small inline planet icon per section */
function SectionIcon({ sectionId, active }: { sectionId: string; active: boolean }) {
  const color = active ? '#D4AF37' : 'rgba(255,255,255,0.35)';
  const size = 16;
  switch (sectionId) {
    case 'destiny-kline':
      return <PlanetIcon planet="saturn" size={size} color={color} />;
    case 'past-proof':
      return <PlanetIcon planet="jupiter" size={size} color={color} />;
    case 'cosmic-profile':
      return <PlanetIcon planet="sun" size={size} color={color} />;
    case 'deep-reading':
      return <PlanetIcon planet="neptune" size={size} color={color} />;
    case 'action-map':
      return <PlanetIcon planet="mars" size={size} color={color} />;
    case 'unlock':
      return <PlanetIcon planet="pluto" size={size} color={color} />;
    default:
      return null;
  }
}

export function FloatingNav({ variant = 'sticky' }: FloatingNavProps) {
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const labels = NAV_COPY[locale as keyof typeof NAV_COPY] ?? NAV_COPY.en;
  const isSticky = variant === 'sticky';

  useEffect(() => {
    const handleScroll = () => {
      const triggerY = window.scrollY + 140;

      let currentSection = SECTIONS[0].id;
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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 88,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={isSticky ? 'sticky top-0 z-40 mb-8 px-4 py-3 md:px-6' : ''}>
      <div
        className={[
          isSticky
            ? 'mx-auto w-full max-w-5xl border-y border-white/[0.08] bg-[#050505]/85 py-3 backdrop-blur-xl'
            : 'w-full',
        ].join(' ')}
      >
        <div
          className={[
            'flex w-max min-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:w-full',
            isSticky ? 'px-1 md:px-0' : 'px-0',
          ].join(' ')}
        >
        {SECTIONS.map((section, idx) => {
          const isActive = activeSection === section.id;
          const copy = labels[section.id as keyof typeof labels];
          return (
            <button
              type="button"
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={[
                'flex shrink-0 items-center gap-2 border px-3 py-2 text-left transition-all duration-300 md:flex-1 md:justify-center',
                isActive
                  ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-white shadow-[0_0_24px_rgba(212,175,55,0.08)]'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/[0.14] hover:text-white/85',
              ].join(' ')}
            >
              <SectionIcon sectionId={section.id} active={isActive} />
              <span className="font-mono text-[10px] text-[#D4AF37]/80">
                0{idx + 1}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] md:hidden">
                {copy.shortLabel}
              </span>
              <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] md:block">
                {copy.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
