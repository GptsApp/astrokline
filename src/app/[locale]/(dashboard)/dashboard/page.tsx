import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/core/i18n/navigation';
import { getUserInfo } from '@/shared/models/user';

import { DashboardWelcomeBanner } from './welcome-banner.client';
import { Heading } from "@/components/astrokline/ui/heading";

export const revalidate = 0; // Prevent caching for the dashboard

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUserInfo();
  const userTier = await getAstroUserTier(user);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome Banner / Empty State */}
      <DashboardWelcomeBanner
        userName={user?.name || undefined}
        userTier={userTier}
      />

      {/* Quick Access Grid with Glassmorphism */}
      <div className="group/cards relative grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link href="/dashboard/kline" className="group block h-full">
          <div className="hover:border-primary/20 relative flex h-full flex-col overflow-hidden -[2rem] border border-white/5 bg-[#15131A]/40 p-8 backdrop-blur-2xl transition-all duration-500 hover:bg-[#15131A]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.05)]">
            {/* Inner Glow */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="bg-primary/5 group-hover:bg-primary/10 pointer-events-none absolute bottom-0 left-0 h-32 w-32 blur-[50px] transition-colors" />

            <Heading level={3} className="mb-3 font-serif text-2xl text-white">
              Destiny K-Line
            </Heading>
            <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
              Dive deep into your life's trajectory. See the planetary highs and
              lows mapped out like financial charts to time your biggest
              decisions.
            </p>
            <div className="text-primary mt-auto inline-flex items-center gap-2 font-bold tracking-wide transition-all group-hover:gap-3">
              Analyze Chart Trends <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
        <Link href="/settings" className="group block h-full">
          <div className="hover:border-primary/20 relative flex h-full flex-col overflow-hidden -[2rem] border border-white/5 bg-[#15131A]/40 p-8 backdrop-blur-2xl transition-all duration-500 hover:bg-[#15131A]/60 hover:shadow-[0_0_40px_rgba(212,175,55,0.05)]">
            {/* Inner Glow */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="bg-primary/5 group-hover:bg-primary/10 pointer-events-none absolute bottom-0 right-0 h-32 w-32 blur-[50px] transition-colors" />

            <Heading level={3} className="mb-3 font-serif text-2xl text-white">
              Account Settings
            </Heading>
            <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
              Manage your personal profile details, active subscriptions, and view API usage metrics.
            </p>
            <div className="text-primary mt-auto inline-flex items-center gap-2 font-bold tracking-wide transition-all group-hover:gap-3">
              Go to Settings <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
