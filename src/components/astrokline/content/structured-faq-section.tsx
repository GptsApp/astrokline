'use client';

import { Heading } from '@/components/astrokline/ui/heading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

export type StructuredFaqItem = {
  question: string;
  answer: string;
};

interface StructuredFaqSectionProps {
  id?: string;
  title: React.ReactNode;
  description?: string;
  items: StructuredFaqItem[];
  className?: string;
  centered?: boolean;
}

export function StructuredFaqSection({
  id = 'faq',
  title,
  description,
  items,
  className,
  centered = false,
}: StructuredFaqSectionProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id={id} className={cn('py-24', className)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-5xl px-6">
        <div className={cn('max-w-3xl', centered && 'mx-auto text-center')}>
          <Heading level={2} variant="section" className="mb-4">
            {title}
          </Heading>
          {description ? (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-10 border border-white/10 bg-[#15131A] p-6 shadow-2xl md:p-10">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="border-b border-white/10 last:border-0"
              >
                <AccordionTrigger className="py-6 text-left text-base font-semibold transition-colors hover:text-primary md:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 pr-6 leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}