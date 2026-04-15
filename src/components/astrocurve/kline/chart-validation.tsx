'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Shield, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { PlanetIcon } from '@/components/icons';
import type { DestinyScorePoint, TransitEvent } from '@/lib/astrokline/mock-astrology-data';

/* ────────── Event Extraction Logic ────────── */

interface ValidationEvent {
  year: number;
  score: number;
  delta: number; // absolute score change from previous year
  transit: TransitEvent;
  questionKey: string; // theme key for i18n lookup
  questionIndex: number; // index within theme
}

const THEME_QUESTIONS: Record<string, Record<string, string[]>> = {
  en: {
    Career: [
      'a major career change or shift in direction',
      'leaving or starting a job, or a pivotal professional turning point',
      'a significant change in your work or career path',
    ],
    Pressure: [
      'a period of intense pressure — burnout, a heavy workload, or external expectations you couldn\'t escape',
      'feeling stuck, exhausted, or pushed to a breaking point by circumstances',
      'a season where life felt unusually heavy or relentless',
    ],
    Relocation: [
      'a major move — to a new city, country, or living situation that changed your daily life',
      'leaving a place that had been home, or arriving somewhere unfamiliar',
      'a physical relocation that also shifted your social world or identity',
    ],
    Wealth: [
      'an unexpected financial event — a windfall, a loss, or a money decision that changed things',
      'a turning point in your financial situation',
      'a significant shift in your income, expenses, or financial outlook',
    ],
    Health: [
      'a health scare, injury, or extended period of physical difficulty',
      'a time when your body forced you to stop and pay attention',
      'a medical event or wellness crisis that changed how you live',
    ],
    Growth: [
      'a personal transformation — a spiritual awakening, education shift, or life-altering decision',
      'something that fundamentally changed how you see yourself or the world',
      'a major life change that reshaped your path forward',
    ],
  },
  ja: {
    Career: [
      '大きなキャリアチェンジや方向転換',
      '転職や独立など、職業人生の大きな転機',
      '仕事や進路における重要な変化',
    ],
    Pressure: [
      '強い圧力を感じた時期 — 燃え尽き、過重な仕事、逃げられない外部のプレッシャー',
      '身動きが取れない、疲弊した、追い詰められたと感じた時期',
      '人生が異常に重く、息が詰まるような季節',
    ],
    Relocation: [
      '新しい都市や国、生活環境への大きな引っ越し',
      '慣れ親しんだ場所を離れる、あるいは知らない土地に着く体験',
      '物理的な移動が社会的な世界やアイデンティティも変えた経験',
    ],
    Wealth: [
      '予期しない金銭的な出来事 — 臨時収入、損失、人生を変えるお金の決断',
      '経済状況の転換点',
      '収入、支出、または財務見通しの大きな変化',
    ],
    Health: [
      '健康の危機、怪我、または長期間の身体的困難',
      '身体が立ち止まることを強いた時期',
      '生き方を変えた医療イベントや健康上の危機',
    ],
    Growth: [
      '個人的な変容 — 精神的な覚醒、学びの転換、人生を変える決断',
      '自分や世界の見方を根本的に変えた出来事',
      '進路を大きく変えた人生の転機',
    ],
  },
  es: {
    Career: [
      'un gran cambio de carrera o un giro de dirección',
      'dejar o empezar un trabajo, o un punto de inflexión profesional decisivo',
      'un cambio significativo en tu trabajo o trayectoria profesional',
    ],
    Pressure: [
      'un período de presión intensa — agotamiento, carga excesiva o expectativas externas ineludibles',
      'sentirte atascado, exhausto o empujado al límite por las circunstancias',
      'una temporada en que la vida se sentía inusualmente pesada',
    ],
    Relocation: [
      'una mudanza importante — a una nueva ciudad, país o situación de vida que cambió tu día a día',
      'dejar un lugar que había sido tu hogar, o llegar a un lugar desconocido',
      'una reubicación física que también cambió tu mundo social o identidad',
    ],
    Wealth: [
      'un evento financiero inesperado — una ganancia, una pérdida o una decisión de dinero que lo cambió todo',
      'un punto de inflexión en tu situación financiera',
      'un cambio significativo en tus ingresos, gastos o perspectiva financiera',
    ],
    Health: [
      'un susto de salud, una lesión o un período prolongado de dificultad física',
      'un momento en que tu cuerpo te obligó a parar y prestar atención',
      'un evento médico o crisis de salud que cambió tu forma de vivir',
    ],
    Growth: [
      'una transformación personal — un despertar espiritual, un cambio educativo o una decisión que alteró tu vida',
      'algo que cambió fundamentalmente cómo te ves a ti mismo o al mundo',
      'un gran cambio de vida que redefinió tu camino',
    ],
  },
};

const UI_COPY = {
  en: {
    header: 'Past Proof — Chart Verification',
    description: (count: number) =>
      `Your planetary positions predicted these moments. We found ${count} significant shifts in your past — confirm if they match, and watch your chart accuracy build.`,
    around: 'Around',
    didYouExperience: ', did you experience',
    yesHappened: 'Yes, that happened',
    notSure: 'Not sure',
    evidence: 'Astrological Evidence',
    allConfirmed: (c: number, t: number) =>
      c === t
        ? `${c}/${t} confirmed — your chart accuracy is verified.`
        : `${c} of ${t} confirmed. Your chart shows meaningful pattern alignment.`,
  },
  ja: {
    header: '過去の検証 — チャート確認',
    description: (count: number) =>
      `あなたの惑星の位置がこれらの瞬間を予測しました。過去に${count}つの重要な変化を検出しました。一致するか確認してください。`,
    around: '',
    didYouExperience: '年頃、次のような経験がありましたか：',
    yesHappened: 'はい、ありました',
    notSure: 'わかりません',
    evidence: '占星学的根拠',
    allConfirmed: (c: number, t: number) =>
      c === t
        ? `${c}/${t} 確認済み — チャートの精度が検証されました。`
        : `${t}件中${c}件確認。チャートに有意なパターン一致が見られます。`,
  },
  es: {
    header: 'Prueba del Pasado — Verificación de Carta',
    description: (count: number) =>
      `Tus posiciones planetarias predijeron estos momentos. Encontramos ${count} cambios significativos en tu pasado — confirma si coinciden.`,
    around: 'Alrededor de',
    didYouExperience: ', ¿experimentaste',
    yesHappened: 'Sí, ocurrió',
    notSure: 'No estoy seguro',
    evidence: 'Evidencia Astrológica',
    allConfirmed: (c: number, t: number) =>
      c === t
        ? `${c}/${t} confirmados — la precisión de tu carta está verificada.`
        : `${c} de ${t} confirmados. Tu carta muestra una alineación significativa.`,
  },
} as const;

function pickQuestion(locale: string, theme: string, index: number): string {
  const lang = THEME_QUESTIONS[locale] ?? THEME_QUESTIONS.en;
  const questions = lang[theme] ?? lang.Growth;
  return questions[index % questions.length];
}

/**
 * Extract the 2 most significant past transit events for validation.
 * Looks for years with the biggest score deltas AND strong transit data.
 */
export function extractValidationEvents(
  klineData: DestinyScorePoint[],
  transitDetails: Record<number, TransitEvent[]>,
  birthYear: number,
): ValidationEvent[] {
  const currentYear = new Date().getFullYear();
  // Only past years where user was 12+
  const pastPoints = klineData.filter(
    (p) => p.year >= birthYear + 12 && p.year < currentYear && transitDetails[p.year]?.length > 0,
  );

  if (pastPoints.length < 2) return [];

  // Calculate delta (change from previous year)
  const withDelta = pastPoints.map((point, i) => {
    const prev = i > 0 ? pastPoints[i - 1] : point;
    return {
      ...point,
      delta: Math.abs(point.score - prev.score),
      transit: transitDetails[point.year][0], // strongest transit for that year
    };
  });

  // Sort by delta * impactScore (biggest perceived change)
  withDelta.sort((a, b) => {
    const aWeight = a.delta * (a.transit.impactScore || 1) + (a.score < 40 || a.score > 80 ? 5 : 0);
    const bWeight = b.delta * (b.transit.impactScore || 1) + (b.score < 40 || b.score > 80 ? 5 : 0);
    return bWeight - aWeight;
  });

  // Pick top 2, ensuring they're at least 3 years apart
  const picked: ValidationEvent[] = [];
  for (const item of withDelta) {
    if (picked.length >= 2) break;
    if (picked.some((p) => Math.abs(p.year - item.year) < 3)) continue;
    picked.push({
      year: item.year,
      score: item.score,
      delta: item.delta,
      transit: item.transit,
      questionKey: item.transit.theme,
      questionIndex: picked.length,
    });
  }

  return picked.sort((a, b) => a.year - b.year);
}

/* ────────── UI Component ────────── */

type CardState = 'pending' | 'confirmed' | 'skipped';

export function ChartValidation({
  klineData,
  transitDetails,
  birthYear,
}: {
  klineData: DestinyScorePoint[];
  transitDetails: Record<number, TransitEvent[]>;
  birthYear: number;
}) {
  const locale = useLocale();
  const copy = UI_COPY[locale as keyof typeof UI_COPY] ?? UI_COPY.en;
  const events = useMemo(
    () => extractValidationEvents(klineData, transitDetails, birthYear),
    [klineData, transitDetails, birthYear],
  );
  const [cardStates, setCardStates] = useState<Record<number, CardState>>({});
  const [dismissed, setDismissed] = useState(false);

  if (events.length === 0 || dismissed) return null;

  const allDone = events.every((e) => cardStates[e.year] === 'confirmed' || cardStates[e.year] === 'skipped');
  const confirmedCount = events.filter((e) => cardStates[e.year] === 'confirmed').length;

  const setCard = (year: number, state: CardState) =>
    setCardStates((prev) => ({ ...prev, [year]: state }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border border-[#D4AF37]/15 bg-gradient-to-b from-[#D4AF37]/[0.04] to-transparent p-5 md:p-6"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#D4AF37]/70" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]/70">
              {copy.header}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-white/25 transition-colors hover:text-white/50"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-white/50">
          {copy.description(events.length)}
        </p>

        {/* Event cards */}
        <div className="space-y-3">
          {events.map((event) => {
            const state = cardStates[event.year] ?? 'pending';

            return (
              <motion.div
                key={event.year}
                layout
                className={cn(
                  'overflow-hidden border transition-colors duration-300',
                  state === 'confirmed'
                    ? 'border-emerald-400/25 bg-emerald-400/[0.04]'
                    : state === 'skipped'
                      ? 'border-white/5 bg-white/[0.01] opacity-50'
                      : 'border-white/10 bg-white/[0.02]',
                )}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Year badge */}
                  <div
                    className={cn(
                      'flex h-10 w-14 shrink-0 items-center justify-center border text-sm font-bold tabular-nums',
                      state === 'confirmed'
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                        : 'border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]',
                    )}
                  >
                    {state === 'confirmed' ? <Check className="h-5 w-5" /> : event.year}
                  </div>

                  <div className="flex-1">
                    {/* Question */}
                    <p className="text-sm text-white/75">
                      {copy.around} <span className="font-semibold text-white">{event.year}</span>{copy.didYouExperience}{' '}
                      <span className="text-white/90">{pickQuestion(locale, event.questionKey, event.questionIndex)}</span>?
                    </p>

                    {/* Transit reveal (on confirm) */}
                    <AnimatePresence>
                      {state === 'confirmed' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 border-t border-emerald-400/10 pt-3"
                        >
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400/80">
                            <PlanetIcon planet="saturn" size={16} className="opacity-60" />
                            {copy.evidence}
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                            <span className="font-medium text-white/75">{event.transit.title}</span>
                            {' — '}
                            {event.transit.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    {state === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCard(event.year, 'confirmed')}
                          className="inline-flex items-center gap-1.5 bg-[#D4AF37] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
                        >
                          <Check className="h-3 w-3" /> {copy.yesHappened}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCard(event.year, 'skipped')}
                          className="px-3 py-1.5 text-[11px] font-medium text-white/30 transition-colors hover:text-white/50"
                        >
                          {copy.notSure}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badge */}
        <AnimatePresence>
          {allDone && confirmedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-sm bg-emerald-400/10 px-4 py-2.5"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-emerald-400/90">
                {copy.allConfirmed(confirmedCount, events.length)}
              </p>
              <ChevronRight className="ml-auto h-3 w-3 text-emerald-400/50" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
