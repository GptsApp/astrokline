import { ReferralCard } from '@/components/astrokline/kline/referral-card';
import { Heading } from '@/components/astrokline/ui/heading';

export default function DashboardInvitePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border border-white/5 bg-[#15131A]/60 p-6 backdrop-blur-xl">
        <Heading level={2} className="text-2xl font-bold text-white mb-2">Invite Friends</Heading>
        <p className="text-muted-foreground text-sm">
          Share your cosmic journey. Invite friends to AstroKline and earn bonus queries and premium rewards.
        </p>
      </div>
      
      <ReferralCard />
    </div>
  );
}
