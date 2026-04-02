'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';

export interface ProductFeature {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  title: string;
  description: string;
  benefits: string[];
  image: string;
  cta: string;
  ctaHref: string;
  reversed?: boolean;
}

export function ProductShowcaseCard({
  feature,
  index,
}: {
  feature: ProductFeature;
  index: number;
}) {
  const { icon: Icon, reversed } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.19, 1.0, 0.22, 1.0] }}
      className={cn(
        'grid grid-cols-1 gap-8 lg:gap-16 items-center',
        'lg:grid-cols-2',
        reversed && 'lg:[direction:rtl] lg:*:[direction:ltr]'
      )}
    >
      {/* Image Side */}
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative group"
      >
        {/* Ambient glow */}
        <div
          className={cn(
            'absolute -inset-4 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none',
            feature.iconBg
          )}
        />
        {/* Image container */}
        <div className="relative overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl">
          <Image
            src={feature.image}
            alt={feature.title}
            width={640}
            height={400}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent pointer-events-none" />
          {/* Floating badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5">
            <Icon className={cn('h-3.5 w-3.5', feature.iconColor)} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">
              {feature.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Text Side */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center border',
              feature.iconBg,
              feature.iconColor.replace('text-', 'border-') + '/30'
            )}
          >
            <Icon className={cn('h-5 w-5', feature.iconColor)} />
          </div>
          <span className={cn('text-[10px] font-mono uppercase tracking-[0.2em]', feature.iconColor)}>
            {feature.label}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-[1.15]">
          {feature.title}
        </h3>

        <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-md">
          {feature.description}
        </p>

        {/* Benefits */}
        <ul className="space-y-3">
          {feature.benefits.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3 text-sm text-white/70"
            >
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0', feature.iconColor.replace('text-', 'bg-'))} />
              {b}
            </motion.li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={feature.ctaHref}
          className={cn(
            'group/cta inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] mt-2 relative',
            feature.iconColor
          )}
        >
          {feature.cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-1" />
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-300 group-hover/cta:w-full" />
        </a>
      </div>
    </motion.div>
  );
}
