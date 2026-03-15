"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Core Profile" },
  { id: "k-line", label: "10-Year Destiny" },
  { id: "radar", label: "Dimension Radar" },
  { id: "diagnosis", label: "Cosmic Diagnosis" },
  { id: "next-30-days", label: "Micro Focus" },
  { id: "report-footer", label: "Final Verdict" }
];

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      // Use middle of screen as the trigger point
      const triggerY = window.scrollY + window.innerHeight / 2;
      
      let currentSection = "hero";
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="fixed left-6 xl:left-12 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-8">
      {/* Decorative vertical line */}
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.05] -z-10" />
      
      {SECTIONS.map((section, idx) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="group flex items-center gap-4 relative"
          >
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ease-out ${isActive ? 'bg-[#D4AF37] border-[#D4AF37] scale-125 shadow-[0_0_12px_rgba(212,175,55,0.6)]' : 'bg-[#0A0A0A] border-white/20 group-hover:border-white/50 group-hover:scale-110'}`} />
            
            <div className={`absolute left-6 flex items-center gap-2 transition-all duration-500 pointer-events-none whitespace-nowrap ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
               <span className="text-[10px] font-mono text-[#D4AF37] opacity-60">0{idx + 1}</span>
               <span className={`text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-white/60'}`}>
                 {section.label}
               </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
