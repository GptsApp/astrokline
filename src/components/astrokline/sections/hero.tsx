"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Calendar, User, Clock, Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { LocationAutocomplete } from "@/components/astrokline/ui/location-autocomplete";
import { useSession } from "@/core/auth/client";
import { useRouter } from "next/navigation";

export function Hero() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="relative overflow-hidden bg-background pt-32 pb-20 md:pt-40 md:pb-28 flex items-center justify-center">
      {/* Background Glow & Particles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-60" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Astrology Chart & K-Line Tracker</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40 leading-tight">
            Stop Guessing Your Future.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5EBBA] via-[#D4AF37] to-[#8B7321]">
              Read Your Astrology K-Line.
            </span>
          </h1>

          <p className="max-w-xl text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
            AstroKline transforms your birth chart into a real-time destiny K-Line — a stunning, AI-powered astrology map that reveals your life&apos;s cosmic peaks, valleys, and turning points at a glance.
          </p>

          {/* Expert Quote */}
          <p className="text-sm md:text-base font-serif italic text-white/40 mb-6 tracking-wide">
            &quot;There are no bad charts — only charts not yet understood.&quot;
            <span className="not-italic text-white/25 text-xs ml-2 font-mono">— Rob Hand</span>
          </p>

          {/* Trust Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex -space-x-4">
              <img className="w-10 h-10 rounded-full border-2 border-background z-30" src="https://i.pravatar.cc/100?img=11" alt="User 1" />
              <img className="w-10 h-10 rounded-full border-2 border-background z-20" src="https://i.pravatar.cc/100?img=32" alt="User 2" />
              <img className="w-10 h-10 rounded-full border-2 border-background z-10" src="https://i.pravatar.cc/100?img=53" alt="User 3" />
            </div>
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-white text-white" />
                ))}
              </div>
              <span className="text-sm text-foreground/80 font-medium">Trusted by <span className="text-white font-bold">26,000+</span> cosmic navigators</span>
            </div>
          </div>

          {/* Quick Trial Module (Google AI Studio Style Glassmorphism Form) */}
          <div className="w-full max-w-5xl relative mt-4 group">
            
            {/* Base Glass Backdrop */}
            <div className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-2xl rounded-2xl shadow-2xl z-0" />

            {/* Ambient Noise and Inner Glow */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-30" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Static Border (Visible when light is not passing) */}
            <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none z-10" />

            {/* The Animated AI Studio Edge Light (Masked specifically to the border) */}
            <div 
              className="absolute inset-[-1px] rounded-[17px] pointer-events-none z-20 overflow-hidden"
              style={{
                padding: '1.5px', // Defines the thickness of the glow border
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            >
              <motion.div
                className="absolute left-1/2 top-1/2 w-[2000px] h-[2000px] origin-center -translate-x-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{
                  background: "conic-gradient(from 0deg, transparent 75%, rgba(212,175,55,0.2) 85%, rgba(252,221,115,1) 100%)"
                }}
              />
            </div>
            
            {/* Form Content (Unmasked to allow autocomplete dropdown overflow) */}
            <div className="relative z-30 p-6 md:p-8 overflow-visible">
              <form className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end overflow-visible" onSubmit={(e) => { 
                e.preventDefault(); 
                if (!session) {
                  router.push('/sign-in');
                } else {
                  router.push('/daily');
                }
              }}>
              <div className="space-y-2 text-left md:col-span-1">
                <Label htmlFor="name" className="text-xs text-muted-foreground font-mono ml-1">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="E.g. Elon" className="pl-9 h-11 bg-black/50 border-white/10 text-white rounded-xl focus-visible:ring-primary/50" />
                </div>
              </div>
              
              <div className="space-y-2 text-left md:col-span-1">
                <Label htmlFor="dob" className="text-xs text-muted-foreground font-mono ml-1">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="dob" type="date" className="pl-9 h-11 bg-black/50 border-white/10 text-white rounded-xl focus-visible:ring-primary/50 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>

              <div className="space-y-2 text-left md:col-span-1">
                <Label htmlFor="time" className="text-xs text-muted-foreground font-mono ml-1">Time (Optional)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="time" type="time" className="pl-9 h-11 bg-black/50 border-white/10 text-white rounded-xl focus-visible:ring-primary/50 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>

              <div className="space-y-2 text-left md:col-span-1 relative">
                <Label htmlFor="location" className="text-xs text-muted-foreground font-mono ml-1">City of Birth</Label>
                <div className="relative">
                  <LocationAutocomplete />
                </div>
              </div>

              <div className="md:col-span-1 h-[44px]">
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:shadow-[0_0_30px_-5px_var(--primary)] whitespace-nowrap px-4"
                >
                  Reveal My K-Line
                  <ArrowRight className="ml-2 w-4 h-4 shrink-0" />
                </Button>
              </div>
            </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
