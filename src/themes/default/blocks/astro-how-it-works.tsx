import dynamic from 'next/dynamic';

const HowItWorks = dynamic(
  () => import('@/components/astrocurve/sections/how-it-works').then(m => m.HowItWorks),
  { loading: () => <div className="min-h-[400px]" /> }
);

import { Section } from '@/shared/types/blocks/landing';

export const AstroHowItWorks = ({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) => {
  return <HowItWorks section={section} />;
};

export default AstroHowItWorks;
