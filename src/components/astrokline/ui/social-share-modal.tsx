'use client';

import { useState } from 'react';
import { Copy, Share2, Check, Twitter } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { trackEvent } from '@/lib/astrokline/track-event';

interface SocialShareModalProps {
  profile: UserProfile;
  trigger?: React.ReactNode;
  className?: string;
  source?: 'kline' | 'daily';
}

export function SocialShareModal({ profile, trigger, className, source = 'kline' }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://astrokline.com';

  // Growth Hacker Strategy: Xiaohongshu / TikTok viral text format
  const generateViralText = () => {
    if (source === 'kline') {
      return `[ AstroKline ] 我拿到了我的深空星盘矩阵！
> 核心配置：太阳 ${profile.sun?.sign} | 月亮 ${profile.moon?.sign} | 上升 ${profile.rising?.sign}
> 元素主导：${profile.elements?.fire > 30 ? '火系爆发' : profile.elements?.earth > 30 ? '土系稳固' : profile.elements?.air > 30 ? '风系灵动' : '水系直觉'}
> 测出来的命运指数超准...简直就是我的人生说明书！

测测你的星盘到底有多硬核？
astrokline.com - 极客专属的专业占星引擎`;
    } else {
      return `[ AstroKline ] 今天的宇宙天气预报准到害怕...
> AstroKline 用真实的瑞士星历告诉我，今天有一颗大行星正在疯狂碾磨我的本命盘！
> 宜：低调行事、相信直觉。
> 忌：今天千万别做重大决定！

你的专属行运日历今天怎么说？
astrokline.com - 实时行运行星追踪器`;
    }
  };

  const viralText = generateViralText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(viralText);
      setCopied(true);
      trackEvent('share_copy_text', { source });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePlatformShare = (platform: string, url: string) => {
    trackEvent('share_platform_click', { platform, source });
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) trackEvent('share_modal_open', { source });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <button className={cn("px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors flex items-center gap-2", className)}>
            <Share2 className="w-4 h-4" />
            Share Your Cosmic Blueprint
          </button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-[#111015]/95 backdrop-blur-xl border border-white/10 p-0 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] rounded-3xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        
        <div className="p-8 pb-6 text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-serif text-white tracking-tight">Share Your Matrix</h2>
          <p className="text-sm text-white/50">Post this on your socials to find your cosmic matches.</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                {viralText}
              </pre>
            </div>
          </div>

          <button 
            onClick={handleCopy}
            className={cn(
              "w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
              copied 
                ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Viral Text
              </>
            )}
          </button>

          {/* Platform Share Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handlePlatformShare('twitter', `https://twitter.com/intent/tweet?text=${encodeURIComponent(viralText)}&url=${encodeURIComponent(shareUrl)}`)}
              className="flex-1 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </button>
            <button
              onClick={() => handlePlatformShare('whatsapp', `https://wa.me/?text=${encodeURIComponent(viralText + '\n' + shareUrl)}`)}
              className="flex-1 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button
              onClick={() => handlePlatformShare('telegram', `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(viralText)}`)}
              className="flex-1 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs font-medium hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
