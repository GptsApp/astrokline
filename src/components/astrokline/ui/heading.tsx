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
  1: "text-5xl md:text-7xl lg:text-[80px] tracking-tighter leading-[1.0] md:leading-[1.0]",
  2: "text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]",
  3: "text-2xl md:text-3xl tracking-tight leading-[1.3] text-foreground/95",
  4: "text-xl md:text-2xl tracking-normal leading-[1.4] text-foreground/90",
  5: "text-lg font-semibold tracking-wide leading-relaxed text-foreground/80",
  6: "text-base font-medium tracking-wide leading-relaxed text-muted-foreground",
};

/* Variant overrides — allows semantic intent without className hacks */
const variantStyles: Record<HeadingVariant, string> = {
  section: "text-3xl md:text-4xl lg:text-5xl tracking-tight leading-[1.15]",
  card:    "text-2xl md:text-3xl tracking-tight leading-[1.3]",
  label:   "text-xs font-semibold tracking-widest uppercase text-muted-foreground",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps & Record<string, any>>(
  ({ className, level = 2, as, variant, children, ...props }, ref) => {
    const Component = as || (`h${level}` as React.ElementType);

    const baseStyles = "font-serif text-foreground font-bold";
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

