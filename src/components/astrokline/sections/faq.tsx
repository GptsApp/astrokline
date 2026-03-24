"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "How is AstroKline different from a regular horoscope?",
      answer: "Regular horoscopes look only at your Sun sign (1 of 12 patterns). AstroKline's astrology AI uses your exact birth time, date, and GPS coordinates to calculate the precise planetary geometry of your natal chart. We then track how current planetary transits interact with your unique birth chart blueprint, providing deeply personalized astrology insights no generic horoscope ever could."
    },
    {
      question: "What is an astrology K-Line and how does the 'Turning Point' work?",
      answer: "The astrology K-Line is AstroKline's signature visualization — inspired by financial K-Line charts — that maps your cosmic energy over time. When slow-moving planets (like Saturn or Pluto) form exact geometric angles to crucial points in your natal chart, major life shifts often occur. Your K-Line visualizes these periods as peaks or dips, helping you anticipate career breakthroughs, relationship tests, or periods of mandatory introspection."
    },
    {
      question: "Is my Destiny Score fixed? Can I change my future?",
      answer: "Astrology is the map, not the car. A low Destiny Score on your K-Line doesn't mean you are doomed — it indicates a period of high friction or required learning (called 'Crossroads' in your astrology chart). A high score indicates cosmic flow and opportunity. By reading your planetary weather, you can choose how to navigate. You always retain free will."
    },
    {
      question: "Do I need my exact birth time for the natal chart reading?",
      answer: "Yes, for maximum birth chart accuracy. Without an exact birth time, AstroKline cannot accurately calculate your Ascendant (Rising Sign) or the Houses of your natal chart, which govern specific life areas like career, wealth, and relationships. If you only know the day, your astrology K-Line will be a broader estimation."
    },
    {
      question: "What is the Destiny Blueprint 'Life Book' export?",
      answer: "The 'Life Book' is a comprehensive, 50+ page HD PDF export of your complete astrology reading. It includes your full natal chart breakdown, a decade-long destiny K-Line projection, deep-dive analysis into your Wealth, Career, and Relationship planetary sectors, and personalized survival guides for upcoming major transits (like your Saturn Return)."
    },
    {
      question: "Can I cancel my AstroKline subscription at any time?",
      answer: "Absolutely. Our 'Compass' and 'Destiny Blueprint' plans auto-renew, but you can cancel the renewal at any time directly from your account settings. You will retain full access to your astrology K-Line, birth chart data, and transit alerts until the end of your current billing period."
    },
    {
      question: "Is my destiny fixed according to my birth chart?",
      answer: "Absolutely not. AstroKline's core philosophy aligns with the world's top astrologers: the birth chart reveals tendencies and potentials, never fixed outcomes. As Rob Hand famously said, \"There are no bad charts — only charts not yet understood.\" Your K-Line shows the cosmic weather — you always choose how to navigate it. We strongly recommend consulting licensed professionals for medical, legal, or financial decisions."
    }
  ];

  // Generate FAQPage JSON-LD structured data for Google rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" aria-labelledby="faq-heading" data-testid="faq-section" className="py-24 bg-background relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 id="faq-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>.
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about interpreting your life&apos;s K-Line.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-[#15131A] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-item-${i}`} className="border-b border-white/10 last:border-0">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pr-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
