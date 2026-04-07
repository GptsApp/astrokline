import { notFound } from 'next/navigation';
import { getUserKlines } from '@/shared/models/kline';
import { getSignUser } from '@/shared/models/user';
import { enrichStoredKlineResult } from '@/lib/astrokline/stored-kline-result';
import { getAstroUserTier } from '@/lib/astrokline/user-tier';
import { PrintKlineContent } from './print-content';

export default async function PrintKlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: klineId } = await params;
  const user = await getSignUser();
  if (!user) return notFound();

  const userTier = await getAstroUserTier(user);
  const klines = await getUserKlines(user.id);
  const kline = klines.find(k => k.id === klineId);
  if (!kline) return notFound();

  const enriched = enrichStoredKlineResult(
    kline.klineResult as any,
    {
      name: kline.label || 'Unknown',
      date: kline.birthDate,
      timeSlot: kline.birthTime || 'unknown',
      location: kline.birthPlace,
      lat: kline.birthLat,
      lon: kline.birthLng,
    },
    userTier
  );

  return <PrintKlineContent klineResult={enriched} label={kline.label} />;
}
