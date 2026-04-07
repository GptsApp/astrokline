"use client";

import { Heading } from "@/components/astrokline/ui/heading";

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
      question: "How is AstroKline different from a daily horoscope?",
      answer: "Daily horoscopes use only your Sun sign — 1 of 12 generic patterns. AstroKline uses your exact birth time, date, and location to calculate the precise planetary geometry unique to you. The result is a personalized timing curve no generic horoscope could ever produce."
    },
    {
      question: "What exactly is a K-Line?",
      answer: "A K-Line is your personal life timeline that maps your energy over 100 years. Peaks show years of natural momentum and opportunity. Dips show years of friction where you should protect, not push. It's the simplest way to see your life's big picture at a glance."
    },
    {
      question: "Is my score fixed? Can I change my future?",
      answer: "No — your score is a weather forecast, not a sentence. A dip means headwinds, not failure. A peak means tailwinds, not guaranteed success. You always retain free will. The K-Line simply helps you choose when to push and when to pause."
    },
    {
      question: "Do I need my exact birth time?",
      answer: "For the most accurate results, yes. Like the most advanced Vedic astrology calculators, your birth time determines your Rising Sign and planetary Dashas (time periods ruled by specific planets). If you only know the date of birth, your chart will still show major predictive astrology trends and general astrology compatibility—just with less precision on specific life-area breakdowns."
    },
    {
      question: "Is my data safe?",
      answer: "Yes. Your birth data is encrypted and never shared with third parties. We use it solely to calculate your chart. You can delete your account and all associated data at any time from your settings."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. Cancel your subscription anytime from your account settings — no questions asked. You keep full access until the end of your billing period. The free tier is yours forever."
    },
    {
      question: "How accurate is the calculation?",
      answer: "We use Swiss Ephemeris (DE431), the same astronomical dataset used by NASA for planetary positions. All calculations are precise to 0.001° and trusted by astrologers worldwide. This is research-grade astronomical precision, not guesswork."
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
            <Heading level={2} variant="section" id="faq-heading" className="mb-4">
              Frequently Asked <span className="text-primary italic font-light">Questions</span>.
            </Heading>
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
          className="bg-[#15131A] border border-white/5  p-6 md:p-10 shadow-2xl"
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
