import Link from 'next/link';
import { FlaskConical, Lock, Sparkles } from 'lucide-react';
import { Heading } from "@/components/astrokline/ui/heading";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="text-center md:text-left">
              <Heading level={3} className="mb-2 bg-gradient-to-r from-[#D4AF37] to-[#FCDD73] bg-clip-text text-xl font-bold text-transparent">
                AstroKline
              </Heading>
              <p className="text-muted-foreground mt-4 max-w-xs text-sm">
                Turn birth-chart data into a clear timing map for stronger
                periods, slower periods, and turning points.
              </p>
            </div>
          </div>

          <div>
            <Heading level={4} className="text-foreground mb-4 font-semibold">Product</Heading>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li>
                <Link
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <Heading level={4} className="text-foreground mb-4 font-semibold">Company</Heading>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <Heading level={4} className="text-foreground mb-4 font-semibold">
              Science & API
            </Heading>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Astronomy data
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Scoring Algorithm
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground flex flex-col items-center justify-between border-t border-white/5 pt-8 text-xs md:flex-row">
          <p>
            © {new Date().getFullYear()} AstroKline. AI-powered astrology meets
            K-Line precision. All rights reserved.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 md:mt-0">
            <span className="text-muted-foreground/50 flex items-center gap-1 font-mono text-[10px]">
              <Lock className="mr-1 inline-block h-3 w-3" /> Data encrypted &
              never shared
            </span>
            <span className="text-muted-foreground/50 flex items-center gap-1 font-mono text-[10px]">
              <FlaskConical className="mr-1 inline-block h-3 w-3" /> Built on
              verified astronomy data
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4 md:mt-0">
            <span className="opacity-50">
              Precision Astrology · Powered by AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
