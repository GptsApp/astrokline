import { Link } from '@/core/i18n/navigation';
import { FlaskConical, Lock, Sparkles } from 'lucide-react';
import { Heading } from "@/components/astrocurve/ui/heading";

const FEATURED_GUIDES = [
  { href: '/blog/what-is-astrology-kline', label: 'What Is AstroCurve?' },
  { href: '/blog/birth-chart-reading-guide', label: 'Birth Chart Reading Guide' },
  { href: '/blog/career-timing-natal-chart', label: 'Career Timing Guide' },
  { href: '/blog/about-us', label: 'AstroCurve Origin Story' },
];

const ZODIAC_GUIDES = [
  { href: '/zodiac/aries', label: 'Aries' },
  { href: '/zodiac/taurus', label: 'Taurus' },
  { href: '/zodiac/gemini', label: 'Gemini' },
  { href: '/zodiac/cancer', label: 'Cancer' },
  { href: '/zodiac/leo', label: 'Leo' },
  { href: '/zodiac/virgo', label: 'Virgo' },
  { href: '/zodiac/libra', label: 'Libra' },
  { href: '/zodiac/scorpio', label: 'Scorpio' },
  { href: '/zodiac/sagittarius', label: 'Sagittarius' },
  { href: '/zodiac/capricorn', label: 'Capricorn' },
  { href: '/zodiac/aquarius', label: 'Aquarius' },
  { href: '/zodiac/pisces', label: 'Pisces' },
];

export function Footer() {
  const shouldDisablePrefetch = (href: string) =>
    href.startsWith('/kline') || href.startsWith('/pricing');

  return (
    <footer className="border-t border-white/5 bg-[#050505] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-5">
          <div>
            <div className="text-center md:text-left">
              <Heading level={3} className="mb-2 bg-gradient-to-r from-[#D4AF37] to-[#FCDD73] bg-clip-text text-xl font-bold text-transparent">
                AstroCurve
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
                  href="/kline"
                  prefetch={shouldDisablePrefetch('/kline') ? false : undefined}
                  className="hover:text-primary transition-colors"
                >
                  Life Curve
                </Link>
              </li>
              <li>
                <Link
                  href="/houses"
                  className="hover:text-primary transition-colors"
                >
                  Houses Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/zodiac"
                  className="hover:text-primary transition-colors"
                >
                  Zodiac Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="hover:text-primary transition-colors"
                >
                  Tools Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  prefetch={shouldDisablePrefetch('/pricing') ? false : undefined}
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/energy"
                  className="hover:text-primary transition-colors"
                >
                  Energy Forecast
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/compatibility"
                  className="hover:text-primary transition-colors"
                >
                  Compatibility Check
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
                  href="/learn-astrology"
                  className="hover:text-primary transition-colors"
                >
                  Learn Astrology
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <Heading level={4} className="text-foreground mb-4 font-semibold">Featured Guides</Heading>
            <ul className="text-muted-foreground space-y-3 text-sm">
              {FEATURED_GUIDES.map((guide) => (
                <li key={guide.href}>
                  <Link href={guide.href} className="hover:text-primary transition-colors">
                    {guide.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={4} className="text-foreground mb-4 font-semibold">Zodiac Guides</Heading>
            <ul className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {ZODIAC_GUIDES.map((sign) => (
                <li key={sign.href}>
                  <Link href={sign.href} className="hover:text-primary transition-colors">
                    {sign.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground flex flex-col items-center justify-between border-t border-white/5 pt-8 text-xs md:flex-row">
          <p>
            © {new Date().getFullYear()} AstroCurve. AI-powered astrology meets
            Cosmic precision. All rights reserved.
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
