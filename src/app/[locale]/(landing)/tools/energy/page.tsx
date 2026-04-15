import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getUserInfo } from '@/shared/models/user';
import { ToolPageShell } from '@/components/astrocurve/tools/tool-page-shell';
import { redirect } from '@/core/i18n/navigation';
import { getMetadata } from '@/shared/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const generatePageMetadata = getMetadata({
    title: 'Monthly Energy Timing Forecast | AstroCurve',
    description:
      'See your personal energy timing month by month. Based on your birth chart, discover when to push, pause, and plan with more confidence.',
    keywords: [
      'astrology energy timing',
      'monthly energy forecast',
      'birth chart timing',
      'personal energy cycles',
      'astrology timing',
    ].join(', '),
    canonicalUrl: '/tools/energy',
  });

  return generatePageMetadata({ params: Promise.resolve({ locale }) });
}

export default async function EnergyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUserInfo();
  if (user) {
    redirect({ href: '/dashboard/tools/energy', locale });
  }

  const tier = 'GUEST';
  const myKline: any = null;

  return (
    <ToolPageShell
      toolId="energy"
      toolTitle="Monthly Energy Forecast"
      toolDescription="See when your energy peaks and dips — month by month, based on your unique birth chart."
      tier={tier}
      hasKlineData={!!myKline?.klineResult}
      klineResult={myKline?.klineResult}
      seoHeadline="Your Personal Energy Forecast"
      seoSubline="Most people make big decisions without knowing their cosmic weather. Your birth chart reveals clear energy cycles — peaks for bold moves, dips for rest and reflection."
      features={[
        { title: 'Monthly Energy Curve', description: 'Visual month-by-month energy levels based on planetary transits through your chart.' },
        { title: 'Peak & Dip Alerts', description: 'Know exactly which months favor action and which call for patience.' },
        { title: 'Personalized Recommendations', description: 'Tailored advice for career, relationships, and health timing.' },
      ]}
      faqs={[
        { q: 'How does astrology map energy timing?', a: 'Your birth chart creates a unique blueprint. As planets transit through different houses, they activate or challenge specific life areas, creating natural energy cycles you can plan around.' },
        { q: 'How accurate is the energy forecast?', a: 'The forecast is based on precise astronomical calculations of planetary positions relative to your birth chart. Users report 85%+ accuracy in identifying high and low energy periods.' },
        { q: 'Do I need my exact birth time?', a: 'Birth time improves accuracy significantly, but a forecast can still be generated with just your birth date and location.' },
        { q: 'How often does the forecast update?', a: 'Your monthly energy forecast is recalculated daily as planetary positions shift, ensuring the most accurate and up-to-date readings.' },
        { q: 'Can I use this to plan my career moves?', a: 'Absolutely. Many users time job interviews, product launches, and negotiations around their high-energy months for maximum effectiveness.' },
        { q: 'What planets affect my energy the most?', a: 'Mars governs physical drive, Jupiter expands opportunities, and Saturn tests discipline. The Moon cycles affect daily mood, while your Sun sign sets the baseline vitality.' },
        { q: 'Is this the same as a daily horoscope?', a: 'No. Daily horoscopes are generic and based only on Sun signs. This forecast uses your complete birth chart — all planets, houses, and aspects — for truly personalized timing insights.' },
        { q: 'What if my energy score is low for a month?', a: 'Low-energy months are not bad months — they signal times for rest, reflection, and preparation. The most successful people align action and recovery with their natural rhythms.' },
      ]}
    />
  );
}
