"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Marquee } from "@/shared/components/ui/marquee";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      title: "Freelance Writer",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=b6e3f4",
      content: "After my breakup I felt completely paralyzed — should I move cities? Change careers? My K-Line showed the emotional pressure would lift in exactly 8 months and a strong creative window was opening. I waited, launched my newsletter at the right time, and it took off. That timing wasn't luck, it was mapped in my chart from day one.",
      score: 5,
      duration: "14 months",
    },
    {
      name: "David Chen",
      title: "Tech Lead",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=David_robot&backgroundColor=ffdfbf",
      content: "As a software engineer, I used to roll my eyes at horoscopes. But mapping my life trajectory as a literal K-Line curve? That made sense. When I saw it correctly identified the exact year I burned out at my previous job, I was sold.",
      score: 4,
      duration: "3 months",
    },
    {
      name: "Elena Rodriguez",
      title: "Small Business Owner",
      avatar: "/images/avatars/diverse/hero_casual_1.webp",
      content: "Best $39.9 I ever spent. Saved me from signing a terrible commercial lease right before a major financial dip.",
      score: 5,
      duration: "1 year",
    },
    {
      name: "Marcus Thorne",
      title: "Consultant",
      avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Marcus&backgroundColor=d1d4f9",
      content: "Scarily accurate.",
      score: 5,
      duration: "2 months",
    },
    {
      name: "Aisha Patel",
      title: "Yoga Instructor",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aisha&backgroundColor=c0aede",
      content: "I check my K-Line whenever anxiety creeps in. Seeing my current 'low period' is actually a known restructuring phase gives me real peace of mind.",
      score: 4,
      duration: "4 months",
    },
    {
      name: "James W.",
      title: "Accountant",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=James&backgroundColor=ffb4e6",
      content: "I'm a numbers person. The dimensional breakdown into Career, Wealth, and Love actually makes sense. My Saturn Return was brutal, but I saw it coming on my K-Line 6 months early and prepared for it. That preparation changed everything for me.",
      score: 5,
      duration: "11 months",
    },
    {
      name: "Riley Cooper",
      title: "Product Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley&style=circle&backgroundColor=cddc39",
      content: "Literally a cheat code for timing big life decisions. If you're on the fence about quitting your job, check your chart first.",
      score: 5,
      duration: "6 months",
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4" />
            They Saw It Coming. You Can Too.
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Real Decisions. Real Timing. Real Results.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            These people used their K-Line to dodge setbacks, seize the right moments, and make decisions with confidence — not guesswork.
          </p>
          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-muted-foreground/70 font-mono">
            <span className="inline-flex items-center gap-1">4.9 <Star className="w-3 h-3 fill-primary text-primary" /> from 26,000+ users</span>
            <span className="hidden sm:inline">·</span>
            <span>94% say it matched their past</span>
            <span className="hidden sm:inline">·</span>
            <span>87% made better decisions</span>
          </div>
        </div>

        {/* Testimonials Marquee */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mt-8">
          <Marquee pauseOnHover className="[--duration:40s]">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-2xl border border-white/5 bg-[#15131A] p-6 overflow-hidden flex flex-col justify-between w-[350px] shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.score)].map((_, index) => (
                      <Star key={index} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                    &quot;{testimonial.content}&quot;
                  </p>
                  
                  {/* Profile */}
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-[#2A2633] border border-white/10 overflow-hidden shadow-inner shrink-0">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">AstroKline user for {(testimonial as any).duration}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Marquee>
          
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background dark:from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background dark:from-background" />
        </div>
      </div>

      {/* Professional Authority Quotes Ribbon */}
      <div className="mt-32 max-w-6xl mx-auto px-6 relative z-10 border-t border-white/5 pt-16">
        <div className="text-center mb-10">
          <h3 className="text-sm font-mono tracking-widest text-primary/50 uppercase">
            Aligned with the Masters
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "There are no bad charts — only charts not yet understood.",
              author: "Rob Hand",
              title: "Author, Planets in Transit"
            },
            {
              quote: "The birth chart is a seed — it shows what can grow, not a prison sentence.",
              author: "Steven Forrest",
              title: "Founder, Evolutionary Astrology"
            },
            {
              quote: "Astrology is a language. If you understand this language, the sky speaks to you.",
              author: "Dane Rudhyar",
              title: "Pioneer of Modern Astrology"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="text-center flex flex-col items-center justify-center space-y-4 p-6 bg-white/[0.02] rounded-2xl border border-white/5"
            >
              <p className="text-sm font-serif italic text-white/50 leading-relaxed">
                &quot;{item.quote}&quot;
              </p>
              <div className="h-[1px] w-8 bg-primary/20" />
              <div>
                <p className="text-xs font-bold text-white/80">{item.author}</p>
                <p className="text-[10px] text-white/30 font-mono mt-1">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
