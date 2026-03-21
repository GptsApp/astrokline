import Image from 'next/image';
import { Star } from 'lucide-react';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64&q=80',
];

export function TrustBadge({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left ${className}`}
    >
      <div className="flex -space-x-3">
        {AVATARS.map((src, i) => (
          <div
            key={i}
            className="border-background relative z-10 h-8 w-8 overflow-hidden rounded-full border-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="User"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        <div className="border-background relative z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#15131A] text-[9px] font-bold text-white/80 shadow-sm">
          10k+
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-center gap-1 sm:justify-start">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
          ))}
        </div>
        <p className="text-muted-foreground text-xs font-medium">
          Trusted by <strong className="text-foreground">100,000+</strong>{' '}
          cosmic explorers
        </p>
      </div>
    </div>
  );
}
