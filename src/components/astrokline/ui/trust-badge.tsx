import { Star } from "lucide-react";
import Image from "next/image";

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64&q=80",
];

export function TrustBadge({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left ${className}`}>
      <div className="flex -space-x-3">
        {AVATARS.map((src, i) => (
          <div key={i} className="relative w-8 h-8 rounded-full border-2 border-background overflow-hidden relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={src} 
              alt="User" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        <div className="relative w-8 h-8 rounded-full border-2 border-background bg-[#15131A] flex items-center justify-center text-[9px] font-bold text-white/80 z-20 shadow-sm">
          10k+
        </div>
      </div>
      
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 justify-center sm:justify-start">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Trusted by <strong className="text-foreground">100,000+</strong> cosmic explorers
        </p>
      </div>
    </div>
  );
}
