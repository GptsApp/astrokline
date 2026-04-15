import { z } from 'zod';

import type { UserProfile } from './mock-astrology-data';
import { getRichFallbackInsight } from './rich-fallback-insight';

const PERSONALITY_SECTION_KEYS = [
  'summary',
  'career',
  'relationships',
  'wealth',
  'health',
  'strengths',
  'warnings',
  'dashaTimeline',
  'marriage',
  'karma',
  'family',
  'children',
  'spirituality',
  'education',
  'authority',
  'lifestyle',
  'hiddenDangers',
] as const;

type PersonalitySectionKey = (typeof PERSONALITY_SECTION_KEYS)[number];

export type PersonalityInsightPayload = {
  nickname: string;
  coreQuote: string;
} & Record<PersonalitySectionKey, string>;

const personalityInsightSchema = z.object({
  nickname: z.string().optional(),
  coreQuote: z.string().optional(),
  summary: z.string().optional(),
  career: z.string().optional(),
  relationships: z.string().optional(),
  wealth: z.string().optional(),
  health: z.string().optional(),
  strengths: z.string().optional(),
  warnings: z.string().optional(),
  dashaTimeline: z.string().optional(),
  marriage: z.string().optional(),
  karma: z.string().optional(),
  family: z.string().optional(),
  children: z.string().optional(),
  spirituality: z.string().optional(),
  education: z.string().optional(),
  authority: z.string().optional(),
  lifestyle: z.string().optional(),
  hiddenDangers: z.string().optional(),
}).passthrough();

const EVIDENCE_PATTERN = /(sun|moon|rising|venus|mars|saturn|house\s*\d+|\d+(st|nd|rd|th)\s+house|sign)/i;
const CORPORATE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bleverage\b/gi, 'use well'],
  [/\boptimi[sz]e\b/gi, 'strengthen'],
  [/strategic positioning/gi, 'clear direction'],
  [/\bsynergy\b/gi, 'chemistry'],
  [/\bbandwidth\b/gi, 'capacity'],
  [/\bstakeholders\b/gi, 'people involved'],
  [/\bdeliverables\b/gi, 'next steps'],
  [/\bKPI\b/gi, 'signal'],
  // ── Copywriter → Counselor softening ──
  [/\bunlock your potential\b/gi, 'step more fully into who you are'],
  [/take .{1,20} to the next level/gi, 'deepen what matters most'],
  [/\bgame[- ]?changer\b/gi, 'quiet shift'],
  [/\bempowerment\b/gi, 'quiet strength'],
  [/\bmindset shift\b/gi, 'inner shift'],
  [/\bmanifest(?:ing)?\b/gi, 'grow into'],
  [/\bpowerhouse\b/gi, 'source of strength'],
  [/\bjourney of self-discovery\b/gi, 'process of understanding yourself'],
];

function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .split('\0').join('')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function softenCorporateVoice(text: string): string {
  return CORPORATE_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text,
  );
}

function ensureEmotionalLead(profile: UserProfile, key: PersonalitySectionKey, text: string): string {
  const emotionalOpeners: Partial<Record<PersonalitySectionKey, string>> = {
    summary: `You feel life through your ${profile.moon.sign} Moon before your ${profile.sun.sign} Sun decides what to do with it.`,
    relationships: `In love, your ${profile.moon.sign} Moon needs safety before your ${profile.sun.sign} Sun can stay fully open.`,
    career: `Your work only feels right when it protects both your ambition and your nervous system.`,
    wealth: `Money in your chart is emotional as much as practical, because security changes how boldly you move.`,
    health: `Your body carries what your heart can't yet say out loud.`,
    strengths: `There are gifts inside you that haven't been fully named yet.`,
    warnings: `The patterns that trip you up are also trying to protect you.`,
    karma: `There's a quiet debt your soul has been carrying — and a promise it's trying to keep.`,
    marriage: `The person you call partner holds a mirror to your deepest vulnerability.`,
  };

  const opener = emotionalOpeners[key];
  if (!opener) return text;
  // Prevent stacking: skip if the opener is already present or text already starts with a matching phrase
  if (text.startsWith(opener.slice(0, 20))) return text;
  if (/^(you\s|your\s|in love|money in your chart|there('s| is) a quiet|the (person|patterns?|gifts?))/i.test(text)) return text;
  return `${opener} ${text}`;
}

function buildDefaultNextSteps(profile: UserProfile, sectionTitle: string): string[] {
  return [
    `Write one concrete ${sectionTitle.toLowerCase()} intention for the next 14 days based on your ${profile.sun.sign} Sun priorities.`,
    `Have one honest conversation this week using your ${profile.moon.sign} Moon emotional language.`,
    `Make one observable decision that reflects your ${profile.rising.sign} Rising identity, then review the result in 7 days.`,
  ];
}

function enforceLengthBudget(key: PersonalitySectionKey, text: string): string {
  const [main = '', action = ''] = text.split(/\n\n###\s*Next Steps\n/i);
  const maxWords = key === 'relationships' ? 300 : key === 'summary' ? 240 : 220;
  const words = main.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  const trimmed = words.slice(0, maxWords).join(' ').replace(/[,:;\-\s]+$/, '');
  return action ? `${trimmed}.\n\n### Next Steps\n${action.trim()}` : `${trimmed}.`;
}

function ensureSectionQuality(
  profile: UserProfile,
  key: PersonalitySectionKey,
  rawValue: string,
  fallbackValue: string,
): { value: string; usedFallback: boolean } {
  let value = sanitizeText(rawValue);
  let usedFallback = false;

  if (value.length < 120) {
    value = sanitizeText(fallbackValue);
    usedFallback = true;
  }

  value = softenCorporateVoice(value);
  value = ensureEmotionalLead(profile, key, value);

  if (!EVIDENCE_PATTERN.test(value)) {
    value += `\n\nThis pattern is shaped by your ${profile.sun.sign} Sun in the ${profile.sun.house}th House, filtered through your ${profile.moon.sign} Moon in the ${profile.moon.house}th House, and expressed outwardly through your ${profile.rising.sign} Rising.`;
  }

  if (!/###\s*next\s*steps/i.test(value)) {
    const defaultSteps = buildDefaultNextSteps(profile, key)
      .map((step) => `- ${step}`)
      .join('\n');
    value += `\n\n### Next Steps\n${defaultSteps}`;
  }

  if (key === 'relationships' && !/What Your Partner Needs to Know/i.test(value)) {
    value += `\n\nWhat Your Partner Needs to Know About You: You need emotional clarity first (${profile.moon.sign} Moon), direct honesty second, and consistent follow-through over grand promises.`;
  }

  value = enforceLengthBudget(key, value);
  return { value, usedFallback };
}

export function normalizePersonalityInsight(
  profile: UserProfile,
  rawInsight: unknown,
): { insight: PersonalityInsightPayload; usedFallbackCount: number } {
  const fallback = getRichFallbackInsight(profile);
  const parsed = personalityInsightSchema.safeParse(rawInsight);
  const candidate = parsed.success ? parsed.data : {};

  const normalized: PersonalityInsightPayload = {
    nickname: sanitizeText(candidate.nickname) || sanitizeText(fallback.nickname),
    coreQuote: sanitizeText(candidate.coreQuote) || sanitizeText(fallback.coreQuote),
    summary: '',
    career: '',
    relationships: '',
    wealth: '',
    health: '',
    strengths: '',
    warnings: '',
    dashaTimeline: '',
    marriage: '',
    karma: '',
    family: '',
    children: '',
    spirituality: '',
    education: '',
    authority: '',
    lifestyle: '',
    hiddenDangers: '',
  };

  let usedFallbackCount = 0;
  for (const key of PERSONALITY_SECTION_KEYS) {
    const { value, usedFallback } = ensureSectionQuality(
      profile,
      key,
      candidate[key] ?? '',
      fallback[key],
    );
    normalized[key] = value;
    if (usedFallback) {
      usedFallbackCount += 1;
    }
  }

  return { insight: normalized, usedFallbackCount };
}
