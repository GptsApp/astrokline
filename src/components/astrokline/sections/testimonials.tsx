"use client";

import { useRef, useEffect } from "react";
import { Star, StarHalf } from "lucide-react";
import Image from "next/image";
import { Heading } from "@/components/astrokline/ui/heading";

// ─── Review Data ───
const REVIEWS = [
  {
    quote: "I used to read daily horoscopes. AstroKline gave me a 5-year strategic map. Avoided a massive bad partnership during my 'Weak Window'.",
    author: "Sarah T.", title: "Tech Founder", avatar: "/images/avatars/sarah.webp", rating: 5.0,
  },
  {
    quote: "In proprietary trading, timing is the only alpha left. This K-Line provides a macroscopic energy map that pure TA often misses.",
    author: "Michael R.", title: "Prop Trader", avatar: "/images/avatars/marcus.webp", rating: 4.8,
  },
  {
    quote: "Knowing when to push and when to protect assets is everything. This K-Line is now a mandatory part of my quarterly planning.",
    author: "Elena M.", title: "Venture Partner", avatar: "/images/avatars/elena.webp", rating: 4.5,
  },
  {
    quote: "The transit alerts saved me from signing a lease during a Saturn square. 3 months later I found a place at half the price.",
    author: "James K.", title: "Product Designer", avatar: "/images/avatars/james.webp", rating: 4.3,
  },
  {
    quote: "I was skeptical until I saw my 2019 dip perfectly matched my burnout year. Now I plan every major move around the curve.",
    author: "Aisha N.", title: "Marketing Director", avatar: "/images/avatars/aisha.webp", rating: 4.8,
  },
  {
    quote: "We use AstroKline charts in our leadership coaching. Clients respond much better when they can see the timing visually.",
    author: "David L.", title: "Executive Coach", avatar: "/images/avatars/david.webp", rating: 4.5,
  },
  {
    quote: "Swiss Ephemeris precision is no joke. Cross-referenced with my ephemeris tables — the data is accurate to the arc-second.",
    author: "Priya S.", title: "Professional Astrologer", avatar: "/images/avatars/diverse/human_1.webp", rating: 5.0,
  },
  {
    quote: "Launched my startup during a 'Strong Window'. Closed our seed round in 3 weeks. Coincidence? The chart says otherwise.",
    author: "Tom W.", title: "SaaS Founder", avatar: "/images/avatars/diverse/human_2.webp", rating: 4.8,
  },
  {
    quote: "The AI reading nailed my Saturn Return experience. Finally someone explains astrology without the woo-woo.",
    author: "Yuki H.", title: "Data Scientist", avatar: "/images/avatars/diverse/human_3.webp", rating: 4.3,
  },
  {
    quote: "Most astrology apps are entertainment. This one is a decision-support tool. Massive difference.",
    author: "Carlos D.", title: "Strategy Consultant", avatar: "/images/avatars/diverse/human_4.webp", rating: 4.5,
  },
  {
    quote: "My 2024 K-Line peak aligned perfectly with my best revenue quarter ever. I'm a believer now.",
    author: "Rachel F.", title: "E-commerce Owner", avatar: "/images/avatars/diverse/human_5.webp", rating: 5.0,
  },
  {
    quote: "The interface is clean, the data is precise, and the AI interpretation is genuinely insightful. Worth every penny.",
    author: "Nathan B.", title: "UX Lead", avatar: "/images/avatars/diverse/human_6.webp", rating: 4.8,
  },
  {
    quote: "I bought the Pro plan for my whole team. We now schedule product launches around strong transit windows.",
    author: "Lisa C.", title: "VP of Product", avatar: "/images/avatars/diverse/human_7.webp", rating: 4.5,
  },
  {
    quote: "Finally, astrology that respects your intelligence. No fear mongering, just transparent astronomical data.",
    author: "Omar A.", title: "Journalist", avatar: "/images/avatars/diverse/human_8.webp", rating: 4.3,
  },
];

// Split into two rows for opposite-direction scrolling
const ROW_1 = REVIEWS.slice(0, 7);
const ROW_2 = REVIEWS.slice(7);

// ─── Star Rating Component ───
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-primary text-primary" />
      ))}
      {hasHalf && <StarHalf className="h-3 w-3 fill-primary text-primary" />}
      <span className="ml-1.5 text-[10px] font-mono text-primary/80">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Review Card ───
function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  return (
    <div className="w-[320px] sm:w-[360px] shrink-0 border border-white/5 bg-white/[0.02] p-5 flex flex-col gap-4 hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <Image
          src={review.avatar}
          alt={review.author}
          width={36}
          height={36}
          className="rounded-full object-cover"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white/90 truncate">{review.author}</p>
          <p className="text-[10px] text-primary/70 font-mono uppercase tracking-wider">{review.title}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-xs text-white/60 leading-relaxed line-clamp-3">&quot;{review.quote}&quot;</p>
    </div>
  );
}

// ─── Infinite Scroll Row ───
function ScrollRow({ reviews, direction }: { reviews: typeof REVIEWS; direction: "left" | "right" }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Pause on hover
    const pause = () => { el.style.animationPlayState = "paused"; };
    const resume = () => { el.style.animationPlayState = "running"; };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => { el.removeEventListener("mouseenter", pause); el.removeEventListener("mouseleave", resume); };
  }, []);

  // Duplicate items for seamless loop
  const items = [...reviews, ...reviews];

  return (
    <div className="overflow-hidden w-full relative">
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div
        ref={scrollRef}
        className={`flex gap-4 w-max ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      >
        {items.map((r, i) => (
          <ReviewCard key={`${r.author}-${i}`} review={r} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───
export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-12 px-6">
          <Heading level={2} variant="section" className="mb-3">
            Trusted by Decision Makers
          </Heading>
          <p className="text-sm text-muted-foreground">Real users. Real turning points. Real results.</p>
        </div>

        <div className="space-y-4">
          <ScrollRow reviews={ROW_1} direction="left" />
          <ScrollRow reviews={ROW_2} direction="right" />
        </div>
      </div>

    </section>
  );
}

