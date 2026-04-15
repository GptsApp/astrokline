import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrocurve/ui/heading';

export function SectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'container space-y-6 py-16 text-center md:py-24',
        className
      )}
    >
      <Heading level={2} variant="section" className="text-center">
        {title}
      </Heading>
      <p>{description}</p>
    </div>
  );
}
