'use client';

import type { DestinyScorePoint, TransitEvent, UserProfile } from '@/lib/astrokline/mock-astrology-data';

interface Props {
  klineResult: any;
  label: string;
}

export function PrintKlineContent({ klineResult, label }: Props) {
  if (!klineResult?.profile) {
    return <div className="p-8 text-white/50">No data available</div>;
  }

  const profile: UserProfile = klineResult.profile;
  const klineData: DestinyScorePoint[] = klineResult.klineData || [];
  const transitDetails: Record<number, TransitEvent[]> = klineResult.transitDetails || {};
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(profile.birthDate?.split('-')[0] || '2000');

  // Get 5-year data
  const fiveYearData = klineData.filter(d => d.year >= currentYear && d.year <= currentYear + 5);

  return (
    <div className="print-page bg-[#0a0a0f] text-white min-h-screen">
      <style>{`
        @page {
          size: A4;
          margin: 12mm 10mm 16mm 10mm;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { break-before: page; }
          .no-break { break-inside: avoid; }
        }
        .print-page { font-family: system-ui, -apple-system, sans-serif; }
      `}</style>

      {/* ── Cover / Header ── */}
      <div className="text-center py-12 border-b border-white/10">
        <p className="text-[10px] font-mono tracking-[0.4em] text-[#D4AF37] uppercase mb-4">AstroKline · Cosmic Blueprint</p>
        <h1 className="font-serif text-4xl font-bold text-white mb-2">{label}'s Life Kline</h1>
        <p className="text-sm text-white/40 mt-3">
          {profile.sun?.sign} ☉ · {profile.moon?.sign} ☽ · {profile.rising?.sign} ↑
        </p>
        <p className="text-xs text-white/20 mt-2">{profile.birthDate} · {profile.birthLocation}</p>
      </div>

      {/* ── Current Energy ── */}
      <div className="no-break py-8 px-6">
        <h2 className="text-xs font-mono tracking-[0.3em] text-[#D4AF37] uppercase mb-4">Current Energy</h2>
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center border border-white/10 text-2xl font-bold text-[#D4AF37]">
            {klineData.find(d => d.year === currentYear)?.score || '—'}
          </div>
          <div>
            <p className="text-sm text-white/80">Overall cosmic energy score for {currentYear}</p>
            <p className="text-xs text-white/40 mt-1">
              Average: {profile.overallAverageScore || '—'} · Peak: {Math.max(...klineData.map(d => d.score))} ({klineData.reduce((a, b) => a.score > b.score ? a : b, klineData[0])?.year})
            </p>
          </div>
        </div>
      </div>

      {/* ── 5-Year Timeline ── */}
      <div className="page-break py-8 px-6">
        <h2 className="text-xs font-mono tracking-[0.3em] text-[#D4AF37] uppercase mb-6">5-Year Strategic Plan</h2>
        <div className="space-y-6">
          {fiveYearData.map(point => {
            const transits = transitDetails[point.year] || [];
            const prevScore = klineData.find(d => d.year === point.year - 1)?.score;
            const delta = prevScore ? point.score - prevScore : 0;
            return (
              <div key={point.year} className="no-break border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl font-bold text-white">{point.year}</span>
                    <span className="text-xs text-white/40">{point.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#D4AF37]">{point.score}</span>
                    {delta !== 0 && (
                      <span className={`text-xs ${delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                {transits.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {transits.slice(0, 3).map((t, i) => (
                      <div key={i} className="text-xs text-white/50 pl-3 border-l-2 border-[#D4AF37]/20">
                        <span className="font-bold text-white/70">{t.title}</span>
                        <span className="text-white/30 ml-2">· {t.planet} {t.aspect}</span>
                        <p className="mt-0.5 text-white/40 leading-relaxed">{t.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI Reading (if available) ── */}
      {klineResult.destinyReading && (
        <div className="page-break py-8 px-6">
          <h2 className="text-xs font-mono tracking-[0.3em] text-[#D4AF37] uppercase mb-6">What We See in Your Chart</h2>
          {Object.entries(klineResult.destinyReading).map(([key, section]: [string, any]) => {
            if (!section?.content) return null;
            return (
              <div key={key} className="no-break mb-6">
                <h3 className="text-sm font-bold text-white/80 mb-2">{section.title || key}</h3>
                <p className="text-xs text-white/50 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-12 py-6 border-t border-white/5 text-center">
        <p className="text-[9px] text-white/15 font-mono tracking-wider">
          Generated by AstroKline.com · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
