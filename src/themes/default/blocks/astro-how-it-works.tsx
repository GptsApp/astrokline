import { HowItWorks } from '@/components/astrokline/sections/how-it-works';

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
