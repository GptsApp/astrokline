'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type AiInsightData,
  getInsightCacheKey,
  getCachedInsight,
  setCachedInsight,
} from '@/lib/astrokline/ai-insight-cache';
import { getModuleDepthBadges } from '@/lib/astrokline/depth-badges';
import type {
  TransitEvent,
  UserProfile,
} from '@/lib/astrokline/mock-astrology-data';
import { ArrowRight, ChevronDown, Lock, Sparkles } from 'lucide-react';

import type { AskChartContextPrompt } from '@/lib/astrokline/ask-chart-client';
import { trackEvent } from '@/lib/astrokline/track-event';
import { cn } from '@/shared/lib/utils';
import { Heading } from "@/components/astrocurve/ui/heading";

type AppTier = 'GUEST' | 'FREE' | 'LITE' | 'PRO';

interface Props {
  profile: UserProfile;
  tier: string;
  // eslint-disable-next-line no-unused-vars
  onActionGate: (...args: [string?, string?]) => void;
  selectedYear?: number;
  yearFocusEvent?: TransitEvent | null;
  klineId?: string;
  initialInsight?: AiInsightData | null;
  allowLegacyFetch?: boolean;
  // eslint-disable-next-line no-unused-vars
  onInsightResolved?: (_insight: AiInsightData) => void;
  // eslint-disable-next-line no-unused-vars
  onContextAsk?: (_prompt: AskChartContextPrompt) => void;
}

interface AiTimingMetrics {
  source: 'initial-complete' | 'initial-incomplete' | 'cache-complete' | 'cache-incomplete' | 'network';
  tier: string;
  phase1Ms?: number;
  guardDelayMs?: number;
  phase2Ms?: number;
  totalMs: number;
  completedAt: string;
}

// ── MODULE CONFIGURATION ──
// Defines which tier unlocks which insight block.
type ModuleKeys =
  | 'summary'
  | 'career'
  | 'wealth'
  | 'love'
  | 'health'
  | 'strengths'
  | 'shadow'
  | 'dashaTimeline'
  | 'marriage'
  | 'karma'
  | 'family'
  | 'children'
  | 'spirituality'
  | 'education'
  | 'authority'
  | 'lifestyle'
  | 'hiddenDangers';

interface ModuleConfig {
  id: ModuleKeys;
  title: string;
  icon: string;
  requiredTier: AppTier;
  shortDesc: string;
  lockedTeaser?: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'summary',
    title: 'Who You Are',
    icon: '🌌',
    requiredTier: 'LITE',
    shortDesc: 'Your personality at a glance.',
    lockedTeaser: 'Your birth chart reveals a unique personality blueprint. Upgrade to discover your core traits, natural talents, and life themes.',
  },
  {
    id: 'career',
    title: 'Career & Direction',
    icon: '💼',
    requiredTier: 'LITE',
    shortDesc: 'Best timing for job changes and big projects.',
    lockedTeaser: 'Your chart shows a specific career window opening soon. See which years favor bold moves and which favor staying put.',
  },
  {
    id: 'wealth',
    title: 'Money & Finances',
    icon: '💎',
    requiredTier: 'LITE',
    shortDesc: 'Spending patterns and financial timing.',
    lockedTeaser: 'Your financial rhythm has clear peaks and valleys. Discover the best years for investing, saving, and taking calculated risks.',
  },
  {
    id: 'love',
    title: 'Relationships & Love',
    icon: '❤️',
    requiredTier: 'LITE',
    shortDesc: 'Connection patterns and compatibility insights.',
    lockedTeaser: 'A meaningful relationship shift is forming in your timeline. Learn when to deepen commitment and when to focus on yourself.',
  },
  {
    id: 'health',
    title: 'Energy & Wellness',
    icon: '⚕️',
    requiredTier: 'LITE',
    shortDesc: 'When to push hard and when to rest.',
    lockedTeaser: 'Your vitality follows a natural rhythm. See which years support peak performance and which call for extra rest and recovery.',
  },
  {
    id: 'dashaTimeline',
    title: 'Life Chapters & Timing',
    icon: '⏳',
    requiredTier: 'LITE',
    shortDesc: 'Your planetary periods and when chapters shift.',
    lockedTeaser: 'Your life moves in distinct chapters governed by planetary rulers. Discover which chapter you are in now and when the next one begins.',
  },
  {
    id: 'marriage',
    title: 'Marriage & Partnership',
    icon: '💍',
    requiredTier: 'LITE',
    shortDesc: 'Your destined partner archetype and timing.',
    lockedTeaser: 'Your 7th House reveals the archetype of your ideal partner and the timing of significant relationship milestones.',
  },
  {
    id: 'karma',
    title: 'Karmic Lessons',
    icon: '🔮',
    requiredTier: 'PRO',
    shortDesc: 'Soul purpose and past-life patterns.',
    lockedTeaser: 'Your North Node reveals why your soul chose this life. Discover the karmic lessons you are here to master.',
  },
  {
    id: 'family',
    title: 'Family & Ancestry',
    icon: '🏠',
    requiredTier: 'PRO',
    shortDesc: 'Inherited patterns from parents and ancestors.',
    lockedTeaser: 'Your 4th House reveals what you inherited emotionally from your family — gifts and burdens that shape your adult life.',
  },
  {
    id: 'children',
    title: 'Children & Legacy',
    icon: '👶',
    requiredTier: 'PRO',
    shortDesc: 'Fertility windows and creative legacy.',
    lockedTeaser: 'Your 5th House holds the blueprint for children, creative output, and the legacy you leave through what you nurture.',
  },
  {
    id: 'spirituality',
    title: 'Spiritual Path',
    icon: '🧘',
    requiredTier: 'PRO',
    shortDesc: 'Your ideal practice and inner awakening.',
    lockedTeaser: 'Your 12th House and Neptune placement reveal the spiritual path that most deeply resonates with your soul.',
  },
  {
    id: 'strengths',
    title: 'Natural Strengths',
    icon: '🔥',
    requiredTier: 'PRO',
    shortDesc: 'The advantages you were born with.',
    lockedTeaser: 'You have a unique combination of traits that gives you an edge in specific areas. Discover what they are and how to use them.',
  },
  {
    id: 'shadow',
    title: 'Patterns to Watch',
    icon: '🌑',
    requiredTier: 'PRO',
    shortDesc: 'Recurring habits that hold you back.',
    lockedTeaser: 'Everyone has blind spots. Your chart reveals a recurring pattern that may be quietly limiting your growth. Awareness is the first step.',
  },
  {
    id: 'education',
    title: 'Intellect & Learning',
    icon: '📚',
    requiredTier: 'PRO',
    shortDesc: 'Your learning style and intellectual gifts.',
    lockedTeaser: 'Mercury and your 3rd/9th House axis reveal how you process information and which fields of study amplify your natural intelligence.',
  },
  {
    id: 'authority',
    title: 'Power & Leadership',
    icon: '👑',
    requiredTier: 'PRO',
    shortDesc: 'Your natural command style and public image.',
    lockedTeaser: 'Your 10th House and Sun placement reveal your leadership style and how the world perceives your authority.',
  },
  {
    id: 'lifestyle',
    title: 'Travel & Comfort',
    icon: '✈️',
    requiredTier: 'PRO',
    shortDesc: 'Where to live, travel windows, and material life.',
    lockedTeaser: 'Your chart reveals ideal living locations, travel periods, and the material comfort you are meant to experience.',
  },
  {
    id: 'hiddenDangers',
    title: 'Caution Zones',
    icon: '⚠️',
    requiredTier: 'PRO',
    shortDesc: 'Health vulnerabilities and years to watch.',
    lockedTeaser: 'Your 6th, 8th, and 12th Houses reveal specific vulnerabilities. Knowing them in advance is your best protection.',
  },
];

interface ModuleGroup {
  id: string;
  title: string;
  description: string;
  moduleIds: ModuleKeys[];
}

interface ContextPromptInput {
  label: string;
  text: string;
  contextSnippet?: string;
  sourceType: AskChartContextPrompt['sourceType'];
  sourceKey: string;
  selectedYear?: number;
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    id: 'identity',
    title: 'Know Yourself',
    description: 'The inner pattern first: who you are, what strengthens you, and which habits quietly shape your path.',
    moduleIds: ['summary', 'strengths', 'shadow', 'education'],
  },
  {
    id: 'real-life',
    title: 'Real Life',
    description: 'The practical layer of your chart: work, money, leadership, and the life conditions you are building around you.',
    moduleIds: ['career', 'wealth', 'authority', 'lifestyle'],
  },
  {
    id: 'relationships',
    title: 'Relationships & Belonging',
    description: 'How you bond, commit, inherit emotional patterns, and create belonging with others.',
    moduleIds: ['love', 'marriage', 'family', 'children'],
  },
  {
    id: 'timing',
    title: 'Timing & Energy',
    description: 'The rhythm of your chapters, your current energy management, and the windows that deserve extra care.',
    moduleIds: ['health', 'dashaTimeline', 'hiddenDangers'],
  },
  {
    id: 'soul',
    title: 'Soul Themes',
    description: 'The deeper layer: karmic lessons, spiritual orientation, and what this life is trying to teach you beneath the surface.',
    moduleIds: ['karma', 'spirituality'],
  },
];

const MODULES_BY_ID: Record<ModuleKeys, ModuleConfig> = Object.fromEntries(
  MODULES.map((module) => [module.id, module])
) as Record<ModuleKeys, ModuleConfig>;

function buildContextPrompt(input: ContextPromptInput): AskChartContextPrompt {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}

function buildContextSnippet(text: string): string {
  return text
    .replace(/#+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function buildModuleContextPrompt(
  moduleId: ModuleKeys,
  selectedYear?: number
): AskChartContextPrompt | null {
  switch (moduleId) {
    case 'summary':
      return buildContextPrompt({
        label: 'Who You Are',
        text: 'Looking at the way my chart is built, what core pattern should I trust more right now?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'career':
      return buildContextPrompt({
        label: 'Career & Direction',
        text: selectedYear
          ? `Looking at my ${selectedYear} timing and career pattern, is this truly a job-change year or a year to strengthen where I am?`
          : 'Looking at my current timing and career pattern, is this truly a job-change year or a year to strengthen where I am?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'wealth':
      return buildContextPrompt({
        label: 'Money & Finances',
        text: 'What is the biggest financial pattern blocking growth in my chart right now, and what should I do differently?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'love':
      return buildContextPrompt({
        label: 'Relationships & Love',
        text: 'What relationship pattern keeps repeating for me, and what is this chart trying to teach me through it?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'health':
      return buildContextPrompt({
        label: 'Energy & Wellness',
        text: selectedYear
          ? `What does my ${selectedYear} energy pattern say about when to push hard and when to protect my energy?`
          : 'What does my current energy pattern say about when to push hard and when to protect my energy?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'marriage':
      return buildContextPrompt({
        label: 'Marriage & Partnership',
        text: 'When is the next serious relationship window opening for me, and what kind of partner fits this chart best?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'karma':
      return buildContextPrompt({
        label: 'Karmic Lessons',
        text: 'What karmic lesson is strongest in my life right now, and how can I work with it instead of repeating it?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'strengths':
      return buildContextPrompt({
        label: 'Natural Strengths',
        text: 'What natural strength in my chart am I underusing most right now, and how should I lean into it?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'shadow':
      return buildContextPrompt({
        label: 'Patterns to Watch',
        text: 'What recurring blind spot is this chart asking me to outgrow right now, and what would breaking it look like?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'dashaTimeline':
      return buildContextPrompt({
        label: 'Life Chapters & Timing',
        text: selectedYear
          ? `Why does ${selectedYear} matter so much in my timeline, and what makes it different from the year after it?`
          : 'Why is this life chapter changing now, and what is the chart asking me to do differently?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'family':
      return buildContextPrompt({
        label: 'Family & Ancestry',
        text: 'What family pattern am I still carrying, and how do I stop repeating it in my adult life?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'children':
      return buildContextPrompt({
        label: 'Children & Legacy',
        text: 'What kind of legacy, creative path, or nurturing role is this chart asking me to build now?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'spirituality':
      return buildContextPrompt({
        label: 'Spiritual Path',
        text: 'What spiritual path or inner practice fits this chart best right now, and what would help me go deeper?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'education':
      return buildContextPrompt({
        label: 'Intellect & Learning',
        text: 'What kind of learning path would unlock the most growth for me right now, based on this chart?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'authority':
      return buildContextPrompt({
        label: 'Power & Leadership',
        text: 'How am I meant to lead or be seen in public, and what is blocking that right now?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'lifestyle':
      return buildContextPrompt({
        label: 'Travel & Comfort',
        text: selectedYear
          ? `What kind of place, rhythm, or travel pattern would support me best in ${selectedYear}?`
          : 'What kind of place, rhythm, or travel pattern would support me best right now?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    case 'hiddenDangers':
      return buildContextPrompt({
        label: 'Caution Zones',
        text: selectedYear
          ? `What risk or vulnerability should I protect against most in ${selectedYear}?`
          : 'What risk or vulnerability should I protect against most right now?',
        sourceType: 'module',
        sourceKey: moduleId,
        selectedYear,
      });
    default:
      return null;
  }
}

function getModuleContextCtaLabel(sourceKey: ModuleKeys, selectedYear?: number): string {
  switch (sourceKey) {
    case 'summary':
      return 'Ask what pattern matters most right now';
    case 'career':
      return 'Ask whether this is really a job-change year';
    case 'wealth':
      return 'Ask what is blocking financial growth';
    case 'love':
      return 'Ask what this relationship pattern is teaching you';
    case 'health':
      return selectedYear ? `Ask how to manage energy in ${selectedYear}` : 'Ask when to push and when to rest';
    case 'marriage':
      return 'Ask when the next serious window opens';
    case 'karma':
      return 'Ask what karmic lesson is active now';
    case 'strengths':
      return 'Ask which strength is underused';
    case 'shadow':
      return 'Ask which blind spot to outgrow';
    case 'dashaTimeline':
      return 'Ask why this chapter is changing now';
    case 'family':
      return 'Ask what family pattern is repeating';
    case 'children':
      return 'Ask what legacy this chart wants to build';
    case 'spirituality':
      return 'Ask which spiritual path fits best';
    case 'education':
      return 'Ask what learning path unlocks growth';
    case 'authority':
      return 'Ask how this chart is meant to lead';
    case 'lifestyle':
      return 'Ask what lifestyle fits this chapter';
    case 'hiddenDangers':
      return selectedYear ? `Ask what risk needs attention in ${selectedYear}` : 'Ask what risk needs attention now';
    default:
      return 'Ask about this insight';
  }
}

function buildYearContextPrompts(
  selectedYear: number,
  yearFocusEvent: TransitEvent
): AskChartContextPrompt[] {
  const contextSnippet = buildContextSnippet(
    `${yearFocusEvent.title}. ${yearFocusEvent.description} ${yearFocusEvent.advice}`
  );

  return [
    buildContextPrompt({
      label: `Year ${selectedYear}`,
      text: `Why is ${selectedYear} such an important year in my chart, and what is the main theme I need to understand?`,
      contextSnippet,
      sourceType: 'year',
      sourceKey: String(selectedYear),
      selectedYear,
    }),
    buildContextPrompt({
      label: `Year ${selectedYear}`,
      text: `What is the biggest risk to avoid in ${selectedYear}, especially around ${yearFocusEvent.theme.toLowerCase()}?`,
      contextSnippet,
      sourceType: 'year',
      sourceKey: `${selectedYear}-risk`,
      selectedYear,
    }),
    buildContextPrompt({
      label: `Year ${selectedYear}`,
      text: `How is ${selectedYear} different from ${selectedYear + 1} in my chart, and which one is better for major decisions?`,
      contextSnippet,
      sourceType: 'year',
      sourceKey: `${selectedYear}-compare`,
      selectedYear,
    }),
  ];
}

const READING_COPY = {
  en: {
    eyebrow: 'Your Personal Reading',
    title: 'Read Your Chart By Chapter',
    guestDescription: 'Create a free account to unlock your personalized reading.',
    description: 'Start with the chapter that matches your question, then open the panels inside it for specific guidance.',
    groups: {
      identity: { title: 'Know Yourself', description: 'The inner pattern first: who you are, what strengthens you, and which habits quietly shape your path.' },
      'real-life': { title: 'Real Life', description: 'The practical layer of your chart: work, money, leadership, and the life conditions you are building around you.' },
      relationships: { title: 'Relationships & Belonging', description: 'How you bond, commit, inherit emotional patterns, and create belonging with others.' },
      timing: { title: 'Timing & Energy', description: 'The rhythm of your chapters, your current energy management, and the windows that deserve extra care.' },
      soul: { title: 'Soul Themes', description: 'The deeper layer: karmic lessons, spiritual orientation, and what this life is trying to teach you beneath the surface.' },
    },
  },
  ja: {
    eyebrow: 'あなた専用のリーディング',
    title: '章ごとに読むあなたのチャート',
    guestDescription: '無料アカウントを作成すると、あなた専用のリーディングが開放されます。',
    description: '気になるテーマに近い章から入り、その中のパネルを開いて具体的な内容を読んでください。',
    groups: {
      identity: { title: '自分を知る', description: 'まずは内側のパターンから。あなたらしさ、強み、そして静かに道を形づくる癖を見ます。' },
      'real-life': { title: '現実の人生', description: '仕事、お金、リーダーシップ、そして生活基盤など、現実面に関わる読みです。' },
      relationships: { title: '関係と居場所', description: 'どうつながり、どう約束し、どんな感情パターンを受け継ぎ、誰と居場所を作るかを読みます。' },
      timing: { title: 'タイミングとエネルギー', description: '人生の章のリズム、今のエネルギー管理、そして注意すべき窓をまとめます。' },
      soul: { title: '魂のテーマ', description: 'カルマ、精神性、この人生が水面下で何を学ばせようとしているかを見る深層レイヤーです。' },
    },
  },
  es: {
    eyebrow: 'Tu Lectura Personal',
    title: 'Lee Tu Carta Por Capítulos',
    guestDescription: 'Crea una cuenta gratuita para desbloquear tu lectura personalizada.',
    description: 'Empieza por el capítulo que mejor coincide con tu pregunta y luego abre los paneles dentro de él para ver la guía específica.',
    groups: {
      identity: { title: 'Conócete', description: 'Primero el patrón interno: quién eres, qué te fortalece y qué hábitos van moldeando tu camino.' },
      'real-life': { title: 'Vida Real', description: 'La capa práctica de tu carta: trabajo, dinero, liderazgo y las condiciones de vida que estás construyendo.' },
      relationships: { title: 'Vínculos y Pertenencia', description: 'Cómo te vinculas, cómo te comprometes, qué patrones emocionales heredas y cómo construyes pertenencia con otros.' },
      timing: { title: 'Tiempo y Energía', description: 'El ritmo de tus etapas, el manejo de tu energía actual y las ventanas que piden más cuidado.' },
      soul: { title: 'Temas del Alma', description: 'La capa profunda: lecciones kármicas, orientación espiritual y lo que esta vida intenta enseñarte debajo de la superficie.' },
    },
  },
} as const;

type PanelInsight = Partial<Record<ModuleKeys, string>>;

const LOADING_PHASE_WIDTH_CLASSES = [
  'w-[15%]',
  'w-[40%]',
  'w-[70%]',
  'w-[92%]',
] as const;

const SKELETON_WIDTH_CLASSES = [
  'w-[75%]',
  'w-[90%]',
  'w-[60%]',
  'w-[85%]',
  'w-[50%]',
] as const;

const PRO_REQUIRED_FIELDS: Array<keyof AiInsightData> = [
  'strengths',
  'warnings',
  'karma',
  'family',
  'children',
  'spirituality',
  'education',
  'authority',
  'lifestyle',
  'hiddenDangers',
];

function hasCompleteInsightForTier(raw: AiInsightData | null | undefined, tier: string): boolean {
  if (!raw) {
    return false;
  }

  if (tier !== 'PRO') {
    return Boolean(normalizeInsight(raw));
  }

  return PRO_REQUIRED_FIELDS.every((field) => {
    const value = raw[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

function normalizeInsight(raw?: AiInsightData | null): PanelInsight | null {
  if (!raw) {
    return null;
  }

  const mapped: PanelInsight = {
    summary: raw.summary,
    career: raw.career,
    wealth: raw.wealth,
    love: raw.relationships ?? raw.love,
    health: raw.health,
    strengths: raw.strengths,
    shadow: raw.warnings ?? raw.shadow,
    dashaTimeline: raw.dashaTimeline,
    marriage: raw.marriage,
    karma: raw.karma,
    family: raw.family,
    children: raw.children,
    spirituality: raw.spirituality,
    education: raw.education,
    authority: raw.authority,
    lifestyle: raw.lifestyle,
    hiddenDangers: raw.hiddenDangers,
  };

  return Object.values(mapped).some(Boolean) ? mapped : null;
}

export function AiReadingPanels({
  profile,
  tier,
  onActionGate,
  selectedYear,
  yearFocusEvent,
  klineId,
  initialInsight,
  allowLegacyFetch = true,
  onInsightResolved,
  onContextAsk,
}: Props) {
  const locale = useLocale();
  const readingCopy = READING_COPY[locale as keyof typeof READING_COPY] ?? READING_COPY.en;
  const insightCacheKey = getInsightCacheKey(profile, tier);
  const [insight, setInsight] = useState<PanelInsight | null>(() =>
    normalizeInsight(initialInsight)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [openModules, setOpenModules] = useState<Set<ModuleKeys>>(() => new Set<ModuleKeys>(['summary']));
  const [lastOpenedModule, setLastOpenedModule] = useState<ModuleKeys>('summary');
  const [timingMetrics, setTimingMetrics] = useState<AiTimingMetrics | null>(null);
  const [showTimingDebug, setShowTimingDebug] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const persistedInsightKeyRef = useRef('');
  const onInsightResolvedRef = useRef(onInsightResolved);
  const profileRef = useRef(profile);
  const initialInsightRef = useRef(initialInsight);

  useEffect(() => {
    setInsight(normalizeInsight(initialInsight));
  }, [initialInsight, klineId]);

  useEffect(() => {
    onInsightResolvedRef.current = onInsightResolved;
  }, [onInsightResolved]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    initialInsightRef.current = initialInsight;
  }, [initialInsight]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const fromQuery = search.get('debugAiTiming') === '1';
    const fromStorage = window.localStorage.getItem('astrocurve_debug_ai_timing') === '1';
    setShowTimingDebug(fromQuery || fromStorage);
  }, []);

  const reportTiming = (metrics: AiTimingMetrics) => {
    setTimingMetrics(metrics);
    if (typeof window === 'undefined') {
      return;
    }

    (window as any).__astrocurveAiTiming = metrics;
    console.info('[AstroCurve][AI Timing]', metrics);
  };

  // Determine if a module is unlocked based on tier precedence
  const isUnlocked = (reqTier: AppTier) => {
    if (tier === 'PRO') return true;
    if (
      tier === 'LITE' &&
      (reqTier === 'LITE' || reqTier === 'FREE' || reqTier === 'GUEST')
    )
      return true;
    if (tier === 'FREE' && (reqTier === 'FREE' || reqTier === 'GUEST'))
      return true;
    if (tier === 'GUEST' && reqTier === 'GUEST') return true;
    return false;
  };

  // Loading phase for animated progress
  const [loadingPhase, setLoadingPhase] = useState(0);
  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startLoadingPhases = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    setLoadingPhase(0);
    phaseTimers.current.push(setTimeout(() => setLoadingPhase(1), 2000));
    phaseTimers.current.push(setTimeout(() => setLoadingPhase(2), 5000));
    phaseTimers.current.push(setTimeout(() => setLoadingPhase(3), 10000));
  };

  const stopLoadingPhases = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
  };

  // Fetch with localStorage cache layer
  useEffect(() => {
    if (tier === 'GUEST' || tier === 'FREE') return;
    let isMounted = true;
    const abortController = new AbortController();
    const startedAt = Date.now();
    const requestProfile = profileRef.current;
    const requestInitialInsight = initialInsightRef.current;

    const buildTiming = (
      source: AiTimingMetrics['source'],
      partial: Pick<AiTimingMetrics, 'phase1Ms' | 'guardDelayMs' | 'phase2Ms'> = {}
    ): AiTimingMetrics => ({
      source,
      tier,
      ...partial,
      totalMs: Date.now() - startedAt,
      completedAt: new Date().toISOString(),
    });

    const applyInsight = (nextInsight: AiInsightData) => {
      const normalized = normalizeInsight(nextInsight);
      if (!normalized && !nextInsight.coreQuote && !nextInsight.nickname) {
        return;
      }

      if (normalized) {
        setInsight(normalized);
      }
      onInsightResolvedRef.current?.(nextInsight);
    };

    const persistInsight = async (nextInsight: AiInsightData) => {
      if (!klineId) {
        return;
      }

      const persistKey = `${klineId}:${JSON.stringify(nextInsight)}`;
      if (persistedInsightKeyRef.current === persistKey) {
        return;
      }

      persistedInsightKeyRef.current = persistKey;

      try {
        await fetch('/api/kline/ai-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ klineId, insight: nextInsight }),
        });
      } catch {
        persistedInsightKeyRef.current = '';
      }
    };

    const hasInitialInsight = normalizeInsight(requestInitialInsight);
    if (hasInitialInsight) {
      applyInsight(requestInitialInsight!);
      if (hasCompleteInsightForTier(requestInitialInsight, tier)) {
        reportTiming(buildTiming('initial-complete'));
        return () => {
          isMounted = false;
          abortController.abort();
        };
      }
      reportTiming(buildTiming('initial-incomplete'));
    }

    // ── 1. Check localStorage cache first (tier-scoped key) ──
    const cached = getCachedInsight(insightCacheKey) as AiInsightData | null;
    if (normalizeInsight(cached)) {
      applyInsight(cached!);
      void persistInsight(cached!);
      if (hasCompleteInsightForTier(cached, tier)) {
        reportTiming(buildTiming('cache-complete'));
        return () => {
          isMounted = false;
          abortController.abort();
        };
      }
      reportTiming(buildTiming('cache-incomplete'));
    }

    if (!allowLegacyFetch) {
      return () => {
        isMounted = false;
        abortController.abort();
        stopLoadingPhases();
      };
    }

    // ── 2. Cache miss — progressive fetch ──
    const fetchBatch = (batchTier: string): Promise<AiInsightData | null> =>
      fetch('/api/astrology/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: requestProfile, tier: batchTier }),
        signal: abortController.signal,
      })
        .then((res) => res.json())
        .then((data) => (data && !data.error ? data : null))
        .catch(() => null);

    const runHeroPrefetch = async () => {
      if (requestInitialInsight?.coreQuote || cached?.coreQuote) {
        return;
      }

      const heroInsight = await fetchBatch('HERO');
      if (!isMounted || !heroInsight) {
        return;
      }

      applyInsight(heroInsight);
      if (!heroInsight._fallback) {
        void persistInsight(heroInsight);
      }
    };

    const runProgressiveFetch = async () => {
      setIsLoading(true);
      startLoadingPhases();

      const phase1StartedAt = Date.now();
      const phase1 = await fetchBatch('LITE');
      const phase1Ms = Date.now() - phase1StartedAt;
      let guardDelayMs: number | undefined;
      let phase2Ms: number | undefined;

      // Phase 1: Priority sections (LITE tier = 7 core sections)
      if (!isMounted) return;

      if (phase1) {
        applyInsight(phase1);
      }

      // Phase 2: Full tier fetch (only if PRO — gets remaining 10 sections)
      if (tier === 'PRO') {
        const elapsedSincePhase1Start = Date.now() - phase1StartedAt;
        if (elapsedSincePhase1Start < 5200) {
          guardDelayMs = 5200 - elapsedSincePhase1Start;
          await new Promise((resolve) => setTimeout(resolve, guardDelayMs));
          if (!isMounted) return;
        }

        const phase2StartedAt = Date.now();
        const phase2 = await fetchBatch('PRO');
        phase2Ms = Date.now() - phase2StartedAt;
        if (!isMounted) return;

        if (phase2) {
          // Merge: phase2 has all 17, it becomes the full result
          applyInsight(phase2);
          if (!phase2._fallback) {
            setCachedInsight(insightCacheKey, phase2);
            void persistInsight(phase2);
          }
        }
      } else if (phase1 && !phase1._fallback) {
        // LITE user — cache phase 1 result
        setCachedInsight(insightCacheKey, phase1);
        void persistInsight(phase1);
      }

      if (isMounted) {
        reportTiming(buildTiming('network', { phase1Ms, guardDelayMs, phase2Ms }));
        setIsLoading(false);
        stopLoadingPhases();
      }
    };

    void runHeroPrefetch();
    void runProgressiveFetch();

    return () => {
      isMounted = false;
      abortController.abort();
      stopLoadingPhases();
    };
  }, [allowLegacyFetch, insightCacheKey, klineId, tier]);

  // 2-way binding: scroll to readings when a Life Curve node is clicked (PRO feature)
  useEffect(() => {
    if (tier === 'PRO' && selectedYear && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Optionally glow or pulse the container to draw attention
      containerRef.current.classList.add(
        'ring-2',
        'ring-primary',
        'ring-offset-2',
        'ring-offset-background'
      );
      setTimeout(() => {
        containerRef.current?.classList.remove(
          'ring-2',
          'ring-primary',
          'ring-offset-2',
          'ring-offset-background'
        );
      }, 2000);
    }
  }, [selectedYear, tier]);

  useEffect(() => {
    if (tier !== 'PRO' || !selectedYear || !yearFocusEvent) {
      return;
    }

    const focusModuleMap: Record<
      TransitEvent['theme'],
      Exclude<ModuleKeys, 'shadow'>
    > = {
      Career: 'career',
      Wealth: 'wealth',
      Love: 'love',
      Growth: 'strengths',
    };

    const targetModule = focusModuleMap[yearFocusEvent.theme];
    setOpenModules((prev) => new Set([...prev, targetModule]));
    setLastOpenedModule(targetModule);
  }, [selectedYear, tier, yearFocusEvent]);

  // Handle module click (multi-open accordion)
  const handleModuleToggle = (id: ModuleKeys, reqTier: AppTier) => {
    if (!isUnlocked(reqTier)) {
      onActionGate(id, reqTier);
      return;
    }
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setLastOpenedModule(id);
      }
      return next;
    });
  };

  const activeGroupId = MODULE_GROUPS.find((group) =>
    group.moduleIds.includes(lastOpenedModule)
  )?.id ?? MODULE_GROUPS[0].id;

  const scrollToGroup = (groupId: string) => {
    document
      .getElementById(`reading-group-${groupId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContextAsk = (prompt: AskChartContextPrompt) => {
    trackEvent('result_context_ask_open', {
      sourceType: prompt.sourceType,
      sourceKey: prompt.sourceKey,
      selectedYear: prompt.selectedYear ?? 'none',
    });
    onContextAsk?.(prompt);
  };

  return (
    <div className="mt-8 flex w-full flex-col gap-4" ref={containerRef}>
      {tier === 'GUEST' ? (
        <p className="mb-6 text-center text-sm text-white/50">
          {readingCopy.guestDescription}
        </p>
      ) : null}

      {showTimingDebug && timingMetrics && (
        <div className="mb-4 border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] px-4 py-3 font-mono text-[11px] text-white/75">
          <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">AI Timing Debug</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            <span>source: {timingMetrics.source}</span>
            <span>total: {timingMetrics.totalMs}ms</span>
            <span>tier: {timingMetrics.tier}</span>
            <span>phase1: {timingMetrics.phase1Ms ?? '-'}ms</span>
            <span>delay: {timingMetrics.guardDelayMs ?? '-'}ms</span>
            <span>phase2: {timingMetrics.phase2Ms ?? '-'}ms</span>
          </div>
        </div>
      )}

      <div className="mb-2 flex w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MODULE_GROUPS.map((group, index) => {
          const isActive = activeGroupId === group.id;
          const groupCopy = readingCopy.groups[group.id as keyof typeof readingCopy.groups];
          return (
            <button
              type="button"
              key={group.id}
              onClick={() => scrollToGroup(group.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 border px-3 py-2 text-left transition-colors',
                isActive
                  ? 'border-[#D4AF37]/35 bg-[#D4AF37]/10 text-white'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/[0.14] hover:text-white/85'
              )}
            >
              <span className="font-mono text-[10px] text-[#D4AF37]/80">0{index + 1}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">{groupCopy?.title ?? group.title}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-4 relative">
        <div className="flex flex-col space-y-4">
        {tier === 'PRO' && selectedYear && yearFocusEvent && (
          <div className=" border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] p-6 lg:p-8">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              <Sparkles className="h-3 w-3" />
              Year Focus {selectedYear}
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center border border-[#D4AF37]/20 bg-[#D4AF37]/8 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#D4AF37]/80">
                Advanced timing layer
              </span>
            </div>
            <Heading level={4} className="font-serif text-2xl text-white/90">
              {yearFocusEvent.title}
            </Heading>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {yearFocusEvent.description}
            </p>
            <p className="mt-5 border-l-2 border-[#D4AF37]/40 bg-white/[0.02] px-5 py-4 text-[13px] leading-relaxed text-white/80">
              {yearFocusEvent.advice}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {buildYearContextPrompts(selectedYear, yearFocusEvent).map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleContextAsk(prompt)}
                  className="inline-flex items-center gap-2 border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-[11px] font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/15"
                >
                  {prompt.text.startsWith('Why')
                    ? `Ask why ${selectedYear} matters`
                    : prompt.text.startsWith('What is the biggest risk')
                      ? `Ask what risk to avoid in ${selectedYear}`
                      : `Ask how ${selectedYear} compares with ${selectedYear + 1}`}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {MODULE_GROUPS.map((group, groupIndex) => (
          <section
            key={group.id}
            id={`reading-group-${group.id}`}
            className="space-y-4 border border-white/[0.08] bg-white/[0.02] p-4 md:p-5"
          >
            {(() => {
              const groupCopy = readingCopy.groups[group.id as keyof typeof readingCopy.groups];
              return (
                <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/75">
                      0{groupIndex + 1} chapter
                    </p>
                    <Heading level={3} className="mt-2 font-serif text-2xl text-white/90">
                      {groupCopy?.title ?? group.title}
                    </Heading>
                  </div>
                  <p className="text-sm leading-6 text-white/55">
                    {groupCopy?.description ?? group.description}
                  </p>
                </div>
              );
            })()}

            {group.moduleIds.map((moduleId) => {
              const mod = MODULES_BY_ID[moduleId];
              const unlocked = isUnlocked(mod.requiredTier);
              const isOpen = openModules.has(mod.id);
              const contextPrompt = buildModuleContextPrompt(mod.id, selectedYear);
              const moduleContextPrompt = contextPrompt && insight?.[mod.id]
                ? {
                    ...contextPrompt,
                    contextSnippet: buildContextSnippet(insight[mod.id] as string),
                  }
                : contextPrompt;
              const depthBadges = getModuleDepthBadges(mod.id, profile);

              return (
                <div
                  key={mod.id}
                  className={cn(
                    'overflow-hidden border backdrop-blur-sm transition-all duration-500',
                    unlocked
                      ? isOpen
                        ? 'border-[#D4AF37]/20 bg-[#D4AF37]/[0.02]'
                        : 'border-white/[0.04] bg-[#0A0A0F]/80 hover:bg-[#0A0A0F] hover:border-white/[0.08]'
                      : 'cursor-not-allowed border-white/[0.02] bg-[#050505]/50 opacity-60'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleModuleToggle(mod.id, mod.requiredTier)}
                    className="group relative flex w-full flex-col px-6 py-5 text-left focus:outline-none"
                  >
                    <div className="z-10 flex w-full items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl opacity-80 transition-transform group-hover:scale-110">
                          {mod.icon}
                        </span>
                        <div>
                          <Heading level={4} className="mb-0.5 text-sm font-bold text-white/90 md:text-base">
                            {mod.title}
                          </Heading>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-white/30 md:text-[11px]">
                            {mod.shortDesc}
                          </p>
                          {depthBadges.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {depthBadges.map((badge) => (
                                <span
                                  key={`${mod.id}-${badge.id}`}
                                  className="inline-flex items-center border border-[#D4AF37]/20 bg-[#D4AF37]/8 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#D4AF37]/80"
                                >
                                  {badge.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {!unlocked ? (
                          <div className="flex items-center gap-2 border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 transition-colors group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/10">
                            <Lock className="h-3.5 w-3.5 text-white/40 transition-colors group-hover:text-[#D4AF37]" />
                            <span className="hidden text-[9px] font-bold uppercase tracking-widest text-white/40 transition-colors group-hover:text-[#D4AF37] md:block">
                              Unlock
                            </span>
                          </div>
                        ) : (
                          <ChevronDown
                            className={cn(
                              'h-5 w-5 text-white/30 transition-transform duration-500',
                              isOpen && 'rotate-180 text-[#D4AF37]'
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {!unlocked && mod.lockedTeaser ? (
                      <div className="z-10 mt-5 w-full">
                        <div className="relative overflow-hidden border border-[#D4AF37]/30 bg-[#050505] p-6 transition-colors duration-300 group-hover:border-[#D4AF37]/50">
                          <div className="mb-3 flex items-center justify-between opacity-50">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-[#D4AF37]">Preview</span>
                            <Lock className="h-3 w-3 text-[#D4AF37]" />
                          </div>

                          {/* Redacted ████ blocks — hint at hidden content */}
                          <div className="space-y-2" aria-hidden="true">
                            {[77, 52, 90, 64, 40].map((w, i) => (
                              <div
                                key={i}
                                className="h-3 bg-[#D4AF37]/[0.07]"
                                style={{ width: `${w}%` }}
                              />
                            ))}
                          </div>

                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 p-6 text-center backdrop-blur-[2px]">
                            <span className="mx-auto max-w-[95%] text-[13px] font-semibold leading-relaxed text-white/90 drop-shadow-lg">
                              {mod.lockedTeaser}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {!unlocked ? (
                      <div className="absolute inset-0 z-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                    ) : null}
                  </button>

                  <AnimatePresence initial={false}>
                    {unlocked && isOpen ? (
                      <motion.div
                        key={`${mod.id}-content`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="relative overflow-hidden">
                          <div className="absolute -top-20 -left-20 h-40 w-40 bg-[#D4AF37]/10 blur-[60px]" />

                          <div className="relative z-10 border-t border-white/[0.04] px-6 pt-2 pb-8">
                            {insight?.[mod.id] ? (
                              <>
                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-white/60 prose-strong:text-white/90 prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-xs prose-h3:font-normal prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-[#D4AF37]">
                                  <AstroTextParser text={insight[mod.id] as string} />
                                </div>
                                {moduleContextPrompt ? (
                                  <div className="mt-6 border-t border-white/[0.06] pt-4">
                                    <button
                                      type="button"
                                      onClick={() => handleContextAsk(moduleContextPrompt)}
                                      className="inline-flex items-center gap-2 border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-[11px] font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/15"
                                    >
                                      {getModuleContextCtaLabel(moduleContextPrompt.sourceKey as ModuleKeys, selectedYear)}
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : null}
                              </>
                            ) : isLoading ? (
                              <div className="flex flex-col items-center gap-4 py-8">
                                <div className="relative h-1 w-full max-w-xs overflow-hidden bg-white/[0.04]">
                                  <div
                                    className={cn(
                                      'absolute inset-y-0 left-0 bg-[#D4AF37]/60 transition-all duration-1000 ease-out',
                                      LOADING_PHASE_WIDTH_CLASSES[loadingPhase]
                                    )}
                                  />
                                </div>
                                <div className="flex items-center gap-2 text-white/40">
                                  <Sparkles className="h-4 w-4 animate-pulse text-[#D4AF37]/50" />
                                  <span className="text-sm transition-opacity duration-500">
                                    {[
                                      'Reading your birth chart...',
                                      'Analyzing planetary aspects...',
                                      'Writing your personalized insight...',
                                      'Almost there, crafting final details...',
                                    ][loadingPhase]}
                                  </span>
                                </div>
                                <div className="mt-2 w-full space-y-3">
                                  {SKELETON_WIDTH_CLASSES.map((widthClass, i) => (
                                    <div
                                      key={widthClass}
                                      className={cn(
                                        'h-3.5 animate-pulse bg-white/[0.03]',
                                        widthClass,
                                        i > 0 && 'animation-delay-[150ms]'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-white/60 prose-strong:text-white/90 prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-xs prose-h3:font-normal prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-[#D4AF37]">
                                <div className="flex flex-col items-center gap-3 py-4 text-center">
                                  <div className="flex items-center gap-2 text-white/30">
                                    <Sparkles className="h-4 w-4 animate-pulse text-[#D4AF37]/50" />
                                    <span className="text-sm">This section is being prepared for your chart.</span>
                                  </div>
                                  <p className="text-[11px] text-white/20">Try another section now, then come back in a moment.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </section>
        ))}
        </div>
      </div>
    </div>
  );
}

// Helper to render markdown-ish text from the AI
function AstroTextParser({ text }: { text: string }) {
  const normText = (text || '').replace(/\\n/g, '\n');
  const paragraphs = normText.split('\n\n').filter((p) => p.trim());

  // Separate main content from action steps
  let isInActionSection = false;
  const mainContent: { text: string; idx: number }[] = [];
  const actionSteps: string[] = [];

  paragraphs.forEach((p, i) => {
    if (p.startsWith('### Next Steps') || p.startsWith('### Action Steps') || p.startsWith('### next steps')) {
      isInActionSection = true;
      return;
    }
    if (isInActionSection) {
      // Collect bullet items as action steps
      if (p.includes('- ')) {
        const lines = p.split('\n').filter(l => l.trim().startsWith('- '));
        lines.forEach(l => actionSteps.push(l.replace(/^-\s*/, '')));
      } else if (p.trim().startsWith('- ')) {
        actionSteps.push(p.trim().replace(/^-\s*/, ''));
      }
      return;
    }
    mainContent.push({ text: p, idx: i });
  });

  return (
    <>
      {mainContent.map(({ text: p, idx: i }) => {
        if (p.startsWith('### ')) {
          return <Heading level={3} key={i}>{p.replace('### ', '')}</Heading>;
        }
        if (p.includes('\n- ')) {
          const lines = p.split('\n');
          const bulletLines = lines
            .filter((line) => line.startsWith('- '))
            .map((line) => line.substring(2));
          const paragraphLines = lines.filter((line) => !line.startsWith('- '));

          return (
            <div key={i} className="mb-4">
              {paragraphLines.map((line, j) => <p key={`${i}-p-${j}`}>{parseBold(line)}</p>)}
              {bulletLines.length > 0 && (
                <ul className="ml-4 list-disc space-y-1 text-white/70">
                  {bulletLines.map((line, j) => (
                    <li key={`${i}-li-${j}`}>{parseBold(line)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        }
        if (p.trim().startsWith('- ')) {
          const bulletLines = p
            .split('\n')
            .filter((line) => line.startsWith('- '))
            .map((line) => line.substring(2));

          return (
            <ul key={i} className="ml-4 list-disc space-y-1 text-white/70">
              {bulletLines.map((line, j) => (
                <li key={`${i}-single-${j}`}>{parseBold(line)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{parseBold(p)}</p>;
      })}

      {/* ── Upgraded Action Steps Card ── */}
      {actionSteps.length > 0 && (
        <div className="mt-8 border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center bg-[#D4AF37]/20 text-[10px] text-[#D4AF37]">🎯</span>
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              Your Action Plan
            </span>
          </div>
          <div className="space-y-3">
            {actionSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#D4AF37]/30 bg-[#D4AF37]/10 font-mono text-[10px] font-bold text-[#D4AF37]">
                  {i + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-white/70 group-hover:text-white/90 transition-colors">
                  {parseBold(step)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-[#D4AF37] opacity-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
