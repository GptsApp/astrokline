"use client";

import Link from "next/link";
import { Sparkles, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSession, signOut } from "@/core/auth/client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-wide text-foreground">
            Life<span className="text-primary">Kline</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Auth & CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isPending ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-4 rounded bg-white/5 animate-pulse" />
              <div className="w-24 h-9 rounded bg-white/10 animate-pulse" />
            </div>
          ) : !session ? (
            <>
              <button onClick={() => router.push('/sign-in')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </button>
              <Button onClick={() => router.push('/sign-in')} className="h-9 px-4 bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Get Started
              </Button>
            </>
          ) : (
            <>
              <Link href="/daily" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors mr-2">
                Go to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <button 
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } })}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
