import dynamic from 'next/dynamic';

const HowItWorks = dynamic(
  () => import('@/components/astrokline/sections/how-it-works').then(m => m.HowItWorks)
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
