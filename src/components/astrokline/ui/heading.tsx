import * as React from "react"
import { cn } from "@/shared/lib/utils"

export type HeadingVariant = "section" | "card" | "label";

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: React.ElementType;
  variant?: HeadingVariant;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

const levelStyles: Record<number, string> = {
  1: "text-5xl md:text-[88px] lg:text-[96px] tracking-tight md:tracking-tighter leading-[1.0] md:leading-[0.95] font-light",
  2: "text-3xl md:text-5xl lg:text-6xl tracking-normal md:tracking-tight leading-[1.1] font-medium",
  3: "text-xl md:text-3xl lg:text-4xl tracking-normal leading-[1.2] font-medium",
  4: "text-lg md:text-2xl tracking-wide leading-[1.3] font-medium italic",
  5: "text-sm md:text-lg tracking-[0.1em] uppercase font-medium font-sans text-foreground/80",
  6: "text-[10px] md:text-xs tracking-[0.15em] leading-none uppercase font-normal font-mono text-muted-foreground",
};

/* Variant overrides — allows semantic intent without className hacks */
const variantStyles: Record<HeadingVariant, string> = {
  section: "text-3xl md:text-5xl lg:text-6xl tracking-normal md:tracking-tight leading-[1.1] font-medium",
  card:    "text-xl md:text-3xl tracking-normal leading-[1.2] font-medium",
  label:   "text-[10px] md:text-xs tracking-[0.15em] leading-none uppercase font-normal font-mono text-muted-foreground",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps & Record<string, any>>(
  ({ className, level = 2, as, variant, children, ...props }, ref) => {
    const Component = as || (`h${level}` as React.ElementType);

    const baseStyles = "font-serif text-foreground";
    const sizeStyles = (variant && variant in variantStyles)
      ? variantStyles[variant as HeadingVariant]
      : (levelStyles[level] ?? levelStyles[2]);

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, sizeStyles, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
)
Heading.displayName = "Heading"

