import { Sparkles, Lock, FlaskConical } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="text-center md:text-left">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#FCDD73] mb-2">AstroKline</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your natal chart destiny, mapped as a K-Line. Navigate life&apos;s planetary turning points with AI-driven astrology precision.
            </p>
          </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">View Demo Chart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Science & API</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Swiss Ephemeris Data</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Scoring Algorithm</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Documentation</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AstroKline. AI-powered astrology meets K-Line precision. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
              <Lock className="w-3 h-3 inline-block mr-1" /> Data encrypted & never shared
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
              <FlaskConical className="w-3 h-3 inline-block mr-1" /> Swiss Ephemeris Certified Precision
            </span>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <span className="opacity-50">Built with Next.js & Launch UI Aesthetics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
