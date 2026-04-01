// @ts-ignore — astronomy-engine has no TS declarations
import * as Astronomy from '../astrology/astronomy-engine.js';

export interface ChartContext {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
}

export interface SynastryScore {
  overall: number;
  romance: number;
  communication: number;
  values: number;
  challenge: number;
  insights: {
    romanceText: string;
    communicationText: string;
    valuesText: string;
    challengeText: string;
  };
}

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

// Angular distance between two points (0 to 180 degrees)
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Elements: Fire=0, Earth=1, Air=2, Water=3
function getElement(degree: number): number {
  const sign = Math.floor(degree / 30) % 12;
  return [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3][sign];
}

// Check aspect (Conjunction=0, Sextile=60, Square=90, Trine=120, Opposition=180)
// Returns closeness (0.0 to 1.0)
function aspectScore(dist: number, target: number, orb: number): number {
  const diff = Math.abs(dist - target);
  if (diff > orb) return 0;
  return 1 - (diff / orb);
}

export function computeChart(d: Date): ChartContext {
  const t = Astronomy.MakeTime(d);
  
  // High precision for Sun and Moon
  const sun = mod360(Astronomy.SunPosition(t).elon);
  const moon = mod360(Astronomy.EclipticGeoMoon(t).lon);
  
  // EclipticLongitude handles planets correctly
  // astronomy-engine expects string body names like 'Mercury'
  const mercury = mod360(Astronomy.EclipticLongitude('Mercury', t));
  const venus = mod360(Astronomy.EclipticLongitude('Venus', t));
  const mars = mod360(Astronomy.EclipticLongitude('Mars', t));

  return { sun, moon, mercury, venus, mars };
}

export function computeCompatibility(date1: Date, date2: Date): SynastryScore {
  const c1 = computeChart(date1);
  const c2 = computeChart(date2);

  // romance (Venus/Mars synergy + Sun/Moon)
  const v1m2 = angleDiff(c1.venus, c2.mars);
  const m1v2 = angleDiff(c1.mars, c2.venus);
  const sunMoon1 = angleDiff(c1.sun, c2.moon);
  const sunMoon2 = angleDiff(c1.moon, c2.sun);

  // Base scores heavily favor Trine(120), Conj(0), Sextile(-), heavily penalize Square(90)
  let romanceBase = 50;
  // Venus-Mars Conj or Trine
  romanceBase += aspectScore(v1m2, 0, 10) * 15 + aspectScore(v1m2, 120, 8) * 12 + aspectScore(v1m2, 180, 8) * 10;
  romanceBase += aspectScore(m1v2, 0, 10) * 15 + aspectScore(m1v2, 120, 8) * 12 + aspectScore(m1v2, 180, 8) * 10;
  // Sun-Moon
  romanceBase += aspectScore(sunMoon1, 0, 10) * 10 + aspectScore(sunMoon1, 120, 8) * 10;
  romanceBase += aspectScore(sunMoon2, 0, 10) * 10 + aspectScore(sunMoon2, 120, 8) * 10;
  
  // communication (Mercury)
  const mercDiff = angleDiff(c1.mercury, c2.mercury);
  let commBase = 60;
  if (getElement(c1.mercury) === getElement(c2.mercury)) commBase += 15;
  commBase += aspectScore(mercDiff, 0, 10) * 20 + aspectScore(mercDiff, 60, 6) * 10 + aspectScore(mercDiff, 120, 8) * 15;
  commBase -= aspectScore(mercDiff, 90, 8) * 15; // Square tension
  
  // values (Sun/Sun, Venus/Venus)
  const sunDiff = angleDiff(c1.sun, c2.sun);
  const venDiff = angleDiff(c1.venus, c2.venus);
  let valBase = 55;
  if (getElement(c1.sun) === getElement(c2.sun)) valBase += 15;
  if (getElement(c1.venus) === getElement(c2.venus)) valBase += 10;
  valBase += aspectScore(sunDiff, 120, 10) * 15 + aspectScore(venDiff, 0, 10) * 10;
  valBase -= aspectScore(sunDiff, 90, 10) * 15; // Square suns clash
  
  // challenges (Mars/Mars friction, Moon/Mars)
  const marsDiff = angleDiff(c1.mars, c2.mars);
  const moonMars1 = angleDiff(c1.moon, c2.mars);
  const moonMars2 = angleDiff(c2.moon, c1.mars);
  let chalBase = 40; // lower is better usually, but here 100 means high tension!
  chalBase += aspectScore(marsDiff, 90, 10) * 25 + aspectScore(marsDiff, 180, 10) * 20;
  chalBase += aspectScore(moonMars1, 90, 8) * 15 + aspectScore(moonMars1, 0, 10) * 10;
  chalBase += aspectScore(moonMars2, 90, 8) * 15 + aspectScore(moonMars2, 0, 10) * 10;
  // If Trine, tension lowers
  chalBase -= aspectScore(marsDiff, 120, 10) * 15;

  // Normalize all
  const clamp = (v: number) => Math.max(40, Math.min(99, Math.round(v)));
  const romance = clamp(romanceBase);
  const communication = clamp(commBase);
  const values = clamp(valBase);
  const challenge = clamp(chalBase); // 99 means explosion of tension

  // Generate Intelligence Dossier Texts
  let romanceText = "A slow-burn connection. Intriguing, but requires conscious cultivation of shared affection.";
  if (romance > 85) romanceText = "Profound Karmic Resonance. A rare Venus-Mars magnetism creates explosive attraction and deep soulful gravity.";
  else if (romance > 70) romanceText = "Strong elemental harmony. Affection aligns naturally, paving the way for deep and stable emotional investment.";

  let communicationText = "You speak different dialects. Radical listening is required to cross the energetic gap in your charts.";
  if (communication > 85) communicationText = "Telepathic synergy. Your Mercury placements form a rare Trine, allowing thoughts to sync without words.";
  else if (communication > 70) communicationText = "Intellectual alignment. Dialogues flow seamlessly and debates are intellectually stimulating rather than draining.";

  let valuesText = "Fundamentally distinct blueprints. Finding common ground will take work, but opens a path for massive mutual growth.";
  if (values > 85) valuesText = "Total structural alignment. Your core Suns share elements, meaning you implicitly want similar life trajectories.";
  else if (values > 70) valuesText = "Highly compatible foundations. While you differ on the details, your underlying ethics and relationship values overlap deeply.";

  let challengeText = "Low-friction synastry. A peaceful, stabilizing bond where tension is easily defused.";
  if (challenge > 80) challengeText = "High-Friction Synastry. Massive potential for conflict triggers. Volatile Moon-Mars squares mean ego battles are highly probable.";
  else if (challenge > 60) challengeText = "Dynamic friction. Sharp energetic edges will force you both to grow, though clashes of will are likely.";

  // Overall favors Romance, Val, Comm. Tension lowers it but slightly adds passion.
  let overall = (romance * 0.35) + (communication * 0.25) + (values * 0.25) + ((100 - challenge) * 0.15);
  // Add a slight variance based on day degrees to avoid identical 85s
  overall = overall + ((c1.moon + c2.sun) % 3);

  return {
    overall: clamp(overall),
    romance,
    communication,
    values,
    challenge,
    insights: { romanceText, communicationText, valuesText, challengeText }
  };
}
