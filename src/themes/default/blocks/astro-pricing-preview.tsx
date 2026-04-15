import { Link } from '@/core/i18n/navigation';

import { Heading } from '@/components/astrocurve/ui/heading';
import { cn } from '@/shared/lib/utils';
import {
  Pricing as PricingSection,
  PricingGroup,
  PricingItem,
} from '@/shared/types/blocks/pricing';

function getPreferredGroup(section: PricingSection) {
  const group =
    section.groups?.find((entry) => {
      const name = (entry.name || '').toLowerCase();
      const title = (entry.title || '').toLowerCase();

      return name.includes('year') || title.includes('year') || Boolean(entry.label);
    }) || section.groups?.[0];

  return group || null;
}

function getPreviewItems(section: PricingSection, group: PricingGroup | null) {
  if (!section.items?.length) {
    return [];
  }

  if (!group?.name) {
    return section.items.slice(0, 3);
  }

  const groupedItems = section.items.filter((item) => item.group === group.name);

  return groupedItems.length > 0 ? groupedItems : section.items.slice(0, 3);
}

function PricingCard({ item }: { item: PricingItem }) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#070707] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]',
        item.is_featured && 'border-primary/40 bg-[#0a0904] shadow-[0_24px_100px_rgba(212,175,55,0.12)]'
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-white/45">
            {item.title}
          </p>
          {item.label && (
            <p className="mt-2 inline-flex border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-primary">
              {item.label}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 border-b border-white/8 pb-5">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-light tracking-tight text-white">
            {item.price || '$0'}
          </span>
          {item.unit && (
            <span className="pb-1 text-sm uppercase tracking-[0.14em] text-white/45">
              {item.unit}
            </span>
          )}
        </div>
        {item.original_price && (
          <p className="mt-2 text-sm text-white/30 line-through">{item.original_price}</p>
        )}
        {item.tip && (
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary/75">{item.tip}</p>
        )}
      </div>

      {item.description && (
        <p className="text-sm leading-6 text-white/72">{item.description}</p>
      )}

      <div className="mt-6 space-y-3 text-sm text-white/72">
        {(item.features || []).slice(0, 5).map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <Link
          href={item.button?.url || '/pricing'}
          className={cn(
            'inline-flex w-full items-center justify-center border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-colors',
            item.is_featured
              ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border-white/14 bg-white/4 text-white hover:bg-white/8'
          )}
        >
          {item.button?.title || 'View Plan'}
        </Link>
      </div>
    </article>
  );
}

export function AstroPricingPreview({
  section,
  className,
}: {
  section: PricingSection;
  className?: string;
}) {
  const selectedGroup = getPreferredGroup(section);
  const previewItems = getPreviewItems(section, selectedGroup);

  if (previewItems.length === 0) {
    return null;
  }

  return (
    <section
      id={section.id || 'pricing'}
      className={cn('relative overflow-hidden bg-background py-24', section.className, className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_44%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Heading level={2} variant="section" className="mb-4">
            {section.title}
          </Heading>
          {section.description && (
            <p className="text-base leading-7 text-muted-foreground md:text-lg">
              {section.description}
            </p>
          )}

          {section.groups && section.groups.length > 0 && (
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 border border-white/10 bg-white/[0.04] p-1 text-[11px] font-mono uppercase tracking-[0.24em] text-white/45">
              {section.groups.map((group) => {
                const isActive = group.name === selectedGroup?.name;

                return (
                  <span
                    key={group.name || group.title}
                    className={cn(
                      'px-3 py-2',
                      isActive && 'bg-white text-black',
                      !isActive && 'text-white/45'
                    )}
                  >
                    {group.title || group.name}
                    {group.label ? ` ${group.label}` : ''}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {previewItems.map((item) => (
            <PricingCard key={item.product_id} item={item} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="text-sm uppercase tracking-[0.2em] text-primary/80 transition-colors hover:text-primary"
          >
            Open full pricing and checkout options
          </Link>
        </div>
      </div>
    </section>
  );
}