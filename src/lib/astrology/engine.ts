/**
 * AstroKline Astrology Engine — Powered by astronomy-engine (VSOP87)
 * ===================================================================
 * Uses Don Cross's astronomy-engine library for high-precision planetary
 * position calculations. Based on VSOP87 (planets) and ELP/MPP02 (Moon)
 * — the same underlying theories used by Swiss Ephemeris and NASA JPL.
 *
 * Precision: ~0.05° (2-3 arcminutes) — more than sufficient for
 * zodiac sign and house placement in natal chart astrology.
 *
 * Zero WASM dependency. Runs on any JS runtime including
 * Cloudflare Workers, Vercel Edge, Node.js, and browsers.
 */

// @ts-expect-error — vendored JS file without type declarations
import * as Astronomy from './astronomy-engine.js';

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: number;     // UTC offset, e.g. +8 for Beijing, -5 for NYC
  latitude: number;
  longitude: number;
}

export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number;
  sign: string;
  signDegree: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  house: number;
  sign: string;
  degree: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
  orb: number;
}

export interface NatalChartResult {
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects: AspectData[];
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
}

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

function sinDeg(d: number): number { return Math.sin(d * DEG); }
function cosDeg(d: number): number { return Math.cos(d * DEG); }
function tanDeg(d: number): number { return Math.tan(d * DEG); }
function atanDeg2(y: number, x: number): number { return Math.atan2(y, x) * RAD; }

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const norm = mod360(longitude);
  const signIndex = Math.floor(norm / 30) % 12;
  const degree = norm % 30;
  return { sign: ZODIAC_SIGNS[signIndex], degree: Math.round(degree * 100) / 100 };
}

// ── Planet definitions ──

const PLANET_LIST = [
  { body: 'Sun',     name: 'Sun',     symbol: 'SUN' },
  { body: 'Moon',    name: 'Moon',    symbol: 'MOO' },
  { body: 'Mercury', name: 'Mercury', symbol: 'MER' },
  { body: 'Venus',   name: 'Venus',   symbol: 'VEN' },
  { body: 'Mars',    name: 'Mars',    symbol: 'MAR' },
  { body: 'Jupiter', name: 'Jupiter', symbol: 'JUP' },
  { body: 'Saturn',  name: 'Saturn',  symbol: 'SAT' },
  { body: 'Uranus',  name: 'Uranus',  symbol: 'URA' },
  { body: 'Neptune', name: 'Neptune', symbol: 'NEP' },
  { body: 'Pluto',   name: 'Pluto',   symbol: 'PLU' },
];

// ── Get geocentric ecliptic longitude for any body ──

function getGeocentricLongitude(bodyName: string, time: any): number {
  if (bodyName === 'Sun') {
    // SunPosition returns geocentric ecliptic coordinates directly
    const sunPos = Astronomy.SunPosition(time);
    return mod360(sunPos.elon);
  }

  if (bodyName === 'Moon') {
    // EclipticGeoMoon returns geocentric ecliptic spherical coordinates
    const moonPos = Astronomy.EclipticGeoMoon(time);
    return mod360(moonPos.lon);
  }

  // For all other planets: get geocentric vector, then convert to ecliptic
  const geoVec = Astronomy.GeoVector(bodyName, time, true); // aberration=true
  const ecliptic = Astronomy.Ecliptic(geoVec);
  return mod360(ecliptic.elon);
}

// ── Check retrograde via speed ──

function isRetrograde(bodyName: string, time: any): boolean {
  if (bodyName === 'Sun' || bodyName === 'Moon') return false;

  // Calculate longitude at time and slightly after
  const lon1 = getGeocentricLongitude(bodyName, time);
  const time2 = Astronomy.MakeTime(time).AddDays(1);
  const lon2 = getGeocentricLongitude(bodyName, time2);

  // Handle wrap-around at 360°
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff < 0;
}

// ── House calculation (Placidus) ──

function calcHouses(
  lstHours: number,
  latitude: number,
  obliquity: number
): { cusps: number[]; ascendant: number; mc: number } {
  const lstDeg = lstHours * 15; // convert hours to degrees

  // Midheaven (MC) — RAMC to ecliptic longitude
  const mc = mod360(atanDeg2(sinDeg(lstDeg), cosDeg(lstDeg) * cosDeg(obliquity)));

  // Ascendant
  const ascNum = cosDeg(lstDeg);
  const ascDen = -(sinDeg(obliquity) * tanDeg(latitude) + cosDeg(obliquity) * sinDeg(lstDeg));
  const asc = mod360(atanDeg2(ascNum, ascDen));

  // Placidus house cusps (simplified interpolation)
  const cusps: number[] = new Array(12);
  cusps[0] = asc;                           // 1st house = ASC
  cusps[9] = mc;                            // 10th house = MC
  cusps[6] = mod360(asc + 180);            // 7th house = DSC
  cusps[3] = mod360(mc + 180);             // 4th house = IC

  // Interpolate intermediate cusps
  cusps[1] = mod360(asc + (mod360(cusps[3] - asc)) / 3);
  cusps[2] = mod360(asc + 2 * (mod360(cusps[3] - asc)) / 3);
  cusps[4] = mod360(cusps[3] + (mod360(cusps[6] - cusps[3])) / 3);
  cusps[5] = mod360(cusps[3] + 2 * (mod360(cusps[6] - cusps[3])) / 3);
  cusps[7] = mod360(cusps[6] + (mod360(mc - cusps[6])) / 3);
  cusps[8] = mod360(cusps[6] + 2 * (mod360(mc - cusps[6])) / 3);
  const ascPlus = asc < mc ? asc + 360 : asc;
  cusps[10] = mod360(mc + (ascPlus - mc) / 3);
  cusps[11] = mod360(mc + 2 * (ascPlus - mc) / 3);

  return { cusps, ascendant: asc, mc };
}

// ── Assign planet to house ──

function assignHouse(planetLon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i];
    const cuspEnd = cusps[(i + 1) % 12];
    if (cuspEnd > cuspStart) {
      if (planetLon >= cuspStart && planetLon < cuspEnd) return i + 1;
    } else {
      if (planetLon >= cuspStart || planetLon < cuspEnd) return i + 1;
    }
  }
  return 1;
}

// ── Main calculation ──

export async function calculateNatalChart(input: BirthInput): Promise<NatalChartResult> {
  // Convert local time to UTC
  const utcHour = input.hour - input.timezone;
  const utcMinute = input.minute;

  // Handle date rollover
  let day = input.day;
  let month = input.month;
  let year = input.year;
  let adjustedHour = utcHour + utcMinute / 60;

  if (adjustedHour < 0) {
    adjustedHour += 24;
    day -= 1;
    // Simple month/year rollback (handle edge cases)
    if (day < 1) {
      month -= 1;
      if (month < 1) { month = 12; year -= 1; }
      day = new Date(year, month, 0).getDate(); // last day of previous month
    }
  } else if (adjustedHour >= 24) {
    adjustedHour -= 24;
    day += 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      day = 1;
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }
  }

  // Create Date object in UTC
  const hour = Math.floor(adjustedHour);
  const minute = Math.round((adjustedHour - hour) * 60);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const time = Astronomy.MakeTime(utcDate);

  // Get obliquity of ecliptic
  const obliquity = Astronomy.e_tilt(time).tobl;

  // Get sidereal time at the observer's location
  const gst = Astronomy.SiderealTime(time); // Greenwich sidereal time in hours
  const lst = mod360((gst * 15) + input.longitude) / 15; // Local sidereal time in hours

  // Calculate houses
  const { cusps, ascendant, mc } = calcHouses(lst, input.latitude, obliquity);

  // Calculate planetary positions
  const planets: PlanetPosition[] = [];

  for (const planetDef of PLANET_LIST) {
    try {
      const lon = getGeocentricLongitude(planetDef.body, time);
      const retrograde = isRetrograde(planetDef.body, time);
      const signInfo = longitudeToSign(lon);

      planets.push({
        name: planetDef.name,
        symbol: planetDef.symbol,
        longitude: lon,
        sign: signInfo.sign,
        signDegree: signInfo.degree,
        house: assignHouse(lon, cusps),
        retrograde,
      });
    } catch (err) {
      console.warn(`Failed to calculate ${planetDef.name}:`, err);
    }
  }

  // Houses array
  const houses: HousePosition[] = cusps.map((deg, i) => ({
    house: i + 1,
    ...longitudeToSign(deg),
  }));

  // Aspects
  const ASPECT_DEFS = [
    { name: "Conjunction", angle: 0, orb: 8 },
    { name: "Sextile", angle: 60, orb: 6 },
    { name: "Square", angle: 90, orb: 7 },
    { name: "Trine", angle: 120, orb: 8 },
    { name: "Opposition", angle: 180, orb: 8 },
  ];

  const aspects: AspectData[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;
      for (const aspectDef of ASPECT_DEFS) {
        const orb = Math.abs(diff - aspectDef.angle);
        if (orb <= aspectDef.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            aspect: aspectDef.name,
            angle: aspectDef.angle,
            orb: Math.round(orb * 100) / 100,
          });
        }
      }
    }
  }

  return {
    planets,
    houses,
    aspects,
    ascendant: longitudeToSign(ascendant),
    midheaven: longitudeToSign(mc),
  };
}

/**
 * Parse a time-slot string like "14:00-15:00" into a midpoint hour.
 * Returns 12 for "unknown".
 */
export function timeSlotToHourMinute(slot: string): { hour: number; minute: number } {
  if (slot === "unknown") return { hour: 12, minute: 0 };
  const [start] = slot.split("-");
  const [h, m] = start.split(":").map(Number);
  return { hour: h, minute: (m || 0) + 30 };
}
