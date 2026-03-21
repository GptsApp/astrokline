import { ComponentType, lazy, Suspense } from 'react';

const iconCache: { [key: string]: ComponentType<any> } = {};

// Map Ri* icon names to lucide-react equivalents (eliminates react-icons 1.9 MB bundle)
const RI_TO_LUCIDE_MAP: Record<string, string> = {
  RiFlashlightFill: 'Zap',
  RiTwitterXFill: 'Twitter',
  RiDiscordFill: 'MessageCircle',
  RiTaskLine: 'CheckSquare',
  RiChat2Line: 'MessageSquare',
  RiKeyLine: 'Key',
  RiQuestionLine: 'HelpCircle',
};

function resolveLucideName(name: string): string {
  // If it's a Ri* name, map to lucide equivalent
  if (name.startsWith('Ri')) {
    return RI_TO_LUCIDE_MAP[name] || 'HelpCircle';
  }
  return name;
}

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  const lucideName = resolveLucideName(name);
  const cacheKey = `lucide-${lucideName}`;

  if (!iconCache[cacheKey]) {
    iconCache[cacheKey] = lazy(async () => {
      try {
        const lucideModule = await import('lucide-react');
        const IconComponent =
          lucideModule[lucideName as keyof typeof lucideModule];
        if (IconComponent) {
          return { default: IconComponent as ComponentType<any> };
        } else {
          console.warn(
            `Icon "${lucideName}" (from "${name}") not found in lucide-react, using fallback`
          );
          return { default: lucideModule.HelpCircle as ComponentType<any> };
        }
      } catch (error) {
        console.error(`Failed to load lucide-react:`, error);
        const fallbackModule = await import('lucide-react');
        return { default: fallbackModule.HelpCircle as ComponentType<any> };
      }
    });
  }

  const IconComponent = iconCache[cacheKey];

  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <IconComponent size={size} className={className} {...props} />
    </Suspense>
  );
}
