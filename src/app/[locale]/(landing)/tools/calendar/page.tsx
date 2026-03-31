import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getUserInfo } from '@/shared/models/user';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { getMyKline } from '@/shared/models/kline';
import { ToolPageShell } from '@/components/astrokline/tools/tool-page-shell';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Action Calendar | AstroKline',
    description: 'Daily astrological guidance tailored to your birth chart. Know the best days for important decisions, meetings, and rest. Free astrology calendar.',
    keywords: ['astrology calendar', 'daily horoscope', 'best days astrology', 'astrological planner', 'birth chart calendar'],
  };
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUserInfo();
  const tier = user ? await getAstroUserTier(user) : 'GUEST';
  const myKline = user ? await getMyKline(user.id) : null;

  return (
    <ToolPageShell
      toolId="calendar"
      toolTitle="Action Calendar"
      toolDescription="Daily guidance tailored to your chart — know when to act and when to wait."
      tier={tier}
      hasKlineData={!!myKline?.klineResult}
      klineResult={myKline?.klineResult}
      seoHeadline="Your Personal Action Calendar"
      seoSubline="Stop guessing which days are good for big moves. Your birth chart reveals natural rhythms — days that favor bold action and days that call for patience."
      features={[
        { title: 'Daily Energy Ratings', description: 'Each day scored and color-coded based on planetary alignments with your birth chart.' },
        { title: 'Best Days for Action', description: 'Highlighted windows for career moves, relationship conversations, and financial decisions.' },
        { title: 'Rest Day Alerts', description: 'Know when to slow down and recharge before the next push.' },
      ]}
      faqs={[
        { q: 'How is my daily guidance calculated?', a: 'We cross-reference real-time planetary transits with your natal chart positions. Each transit activates specific life areas, creating a personalized daily forecast.' },
        { q: 'Can I plan important events around this?', a: 'Many users time job interviews, launches, and important conversations around their high-energy days with great success.' },
        { q: 'How far ahead can I see?', a: 'Free users see 7 days ahead. Lite subscribers get a full 30-day calendar with detailed daily breakdowns.' },
        { q: 'Is this different from a generic horoscope?', a: 'Yes. Generic horoscopes use only your Sun sign. Our calendar uses your full natal chart — Moon, rising sign, and all planetary positions — for precision guidance.' },
        { q: 'What does a "rest day" actually mean?', a: 'Rest days indicate periods when planetary energy suggests reflection over action. These are ideal for journaling, strategy planning, and self-care — not inactivity.' },
        { q: 'Can I sync this with my real calendar?', a: 'We are building calendar integrations. Currently, you can screenshot or bookmark your weekly view for quick reference throughout the week.' },
        { q: 'Do retrograde periods show up?', a: 'Yes. Mercury, Venus, and Mars retrogrades are factored into your daily scores. Retrograde periods often lower action scores and raise reflection scores.' },
        { q: 'How should I use the DO and DON\'T recommendations?', a: 'Think of them as gentle nudges, not rigid rules. They highlight areas where cosmic energy supports you (DO) or where extra caution helps (DON\'T).' },
      ]}
    />
  );
}
