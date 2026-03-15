import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getUserInfo } from '@/shared/models/user';
import { getCurrentSubscription, SubscriptionStatus } from '@/shared/models/subscription';
import { Link } from '@/core/i18n/navigation';
import { DashboardWelcomeBanner } from './welcome-banner.client';

export const revalidate = 0; // Prevent caching for the dashboard

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUserInfo();
  
  // Get real subscription status to display Tier
  let userTier = "FREE";
  if (user) {
    const sub = await getCurrentSubscription(user.id);
    if (sub && (sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIALING)) {
      if (sub.productId === 'premium' || sub.productId === 'premium-monthly' || sub.productId === 'premium-yearly') {
        userTier = "PREMIUM";
      } else {
        userTier = "STANDARD";
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner / Empty State */}
      <DashboardWelcomeBanner userName={user?.name || undefined} userTier={userTier} />

      {/* Quick Access Grid with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative group/cards">
        <Link href="/dashboard/daily" className="group block h-full">
          <div className="h-full p-8 rounded-[2rem] border border-white/5 bg-[#15131A]/40 backdrop-blur-2xl hover:border-primary/20 hover:bg-[#15131A]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.05)] transition-all duration-500 flex flex-col relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
            
            <h3 className="text-2xl font-serif text-white mb-3">Daily Forecast</h3>
            <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
              Check out the planetary transits for today. We analyze Love, Career, Wealth, and Health dimensions dynamically against your natal chart.
            </p>
            <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all mt-auto tracking-wide">
              Read Today's Energy <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/kline" className="group block h-full">
          <div className="h-full p-8 rounded-[2rem] border border-white/5 bg-[#15131A]/40 backdrop-blur-2xl hover:border-primary/20 hover:bg-[#15131A]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.05)] transition-all duration-500 flex flex-col relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-colors" />

            <h3 className="text-2xl font-serif text-white mb-3">Destiny K-Line</h3>
            <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
              Dive deep into your life's trajectory. See the planetary highs and lows mapped out like financial charts to time your biggest decisions.
            </p>
            <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all mt-auto tracking-wide">
              Analyze Chart Trends <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

    </div>
  );
}
