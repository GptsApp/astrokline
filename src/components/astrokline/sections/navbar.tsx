'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LogOut, Menu, Sparkles, User, X } from 'lucide-react';

import { signOut, useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-background/60 fixed top-0 right-0 left-0 z-50 border-b border-white/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-primary/10 border-primary/20 group-hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border transition-colors">
            <Sparkles className="text-primary h-4 w-4" />
          </div>
          <span className="text-foreground text-lg font-bold tracking-wide">
            Astro<span className="text-primary">Kline</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-primary hover:text-primary/80 bg-primary/10 border-primary/20 rounded-full border px-3 py-1 text-sm font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Auth & CTA */}
        <div className="hidden items-center gap-4 md:flex">
          {!session ? (
            <>
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Button
                asChild
                className="h-9 rounded-full bg-white px-4 font-semibold text-black shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-white/90"
              >
                <Link href="/kline">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/kline"
                className="text-primary hover:text-primary/80 mr-2 text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push('/');
                        },
                      },
                    })
                  }
                  className="text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle mobile menu"
          className="text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="bg-background/95 animate-in slide-in-from-top absolute top-16 right-0 left-0 z-40 border-b border-white/10 shadow-2xl backdrop-blur-xl duration-200 md:hidden">
          <nav className="flex flex-col gap-4 px-6 py-6">
            <Link
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-primary border-b border-white/5 py-2 text-base font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-primary border-b border-white/5 py-2 text-base font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-primary border-b border-white/5 py-2 text-base font-medium transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-primary border-b border-white/5 py-2 text-base font-medium transition-colors"
            >
              FAQ
            </Link>

            <div className="flex flex-col gap-3 pt-4">
              {!session ? (
                <>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-xl font-bold shadow-[0_0_20px_-5px_var(--primary)]"
                  >
                    <Link
                      href="/kline"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="text-muted-foreground hover:text-foreground block w-full py-2 text-center text-sm transition-colors"
                  >
                    Already have an account? Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard/kline"
                  onClick={() => setMobileOpen(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-full items-center justify-center rounded-xl font-bold shadow-[0_0_20px_-5px_var(--primary)]"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
