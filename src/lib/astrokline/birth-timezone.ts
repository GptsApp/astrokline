import tzLookup from 'tz-lookup';

type BirthTimezoneContext = {
  date?: string | null;
  timeSlot?: string | null;
  lat?: number | string | null;
  lon?: number | string | null;
  timezoneValue?: number | null;
  timeZoneId?: string | null;
};

type ParsedDate = {
  year: number;
  month: number;
  day: number;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toFiniteNumber(value: number | string | null | undefined) {
  const nextValue = typeof value === 'string' ? Number(value) : value;
  return typeof nextValue === 'number' && Number.isFinite(nextValue)
    ? nextValue
    : null;
}

function parseIsoDate(date: string | null | undefined): ParsedDate | null {
  if (!date || !ISO_DATE_PATTERN.test(date)) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return { year, month, day };
}

function getTimeSlotStart(timeSlot: string | null | undefined) {
  if (!timeSlot || timeSlot === 'unknown') {
    return { hour: 12, minute: 0 };
  }

  const [start] = timeSlot.split('-');
  const [hour, minute = '0'] = start.split(':');
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);

  if (!Number.isFinite(parsedHour) || !Number.isFinite(parsedMinute)) {
    return { hour: 12, minute: 0 };
  }

  return { hour: parsedHour, minute: parsedMinute };
}

function getFormatterParts(utcMs: number, timeZoneId: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(new Date(utcMs));
  const getValue = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: getValue('year'),
    month: getValue('month'),
    day: getValue('day'),
    hour: getValue('hour'),
    minute: getValue('minute'),
    second: getValue('second'),
  };
}

function getUtcOffsetAtInstant(utcMs: number, timeZoneId: string) {
  const parts = getFormatterParts(utcMs, timeZoneId);
  const zonedUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return (zonedUtcMs - utcMs) / (60 * 60 * 1000);
}

export function resolveBirthTimezoneContext(input: BirthTimezoneContext) {
  const lat = toFiniteNumber(input.lat);
  const lon = toFiniteNumber(input.lon);

  if (lat === null || lon === null) {
    return { timeZoneId: null, timezoneValue: null };
  }

  try {
    const timeZoneId = tzLookup(lat, lon);
    const parsedDate = parseIsoDate(input.date);

    if (!parsedDate) {
      return { timeZoneId, timezoneValue: null };
    }

    const { hour, minute } = getTimeSlotStart(input.timeSlot);
    const localWallClockMs = Date.UTC(
      parsedDate.year,
      parsedDate.month - 1,
      parsedDate.day,
      hour,
      minute,
      0
    );

    const firstPassOffset = getUtcOffsetAtInstant(localWallClockMs, timeZoneId);
    const correctedUtcMs =
      localWallClockMs - firstPassOffset * 60 * 60 * 1000;
    const refinedOffset = getUtcOffsetAtInstant(correctedUtcMs, timeZoneId);

    return {
      timeZoneId,
      timezoneValue: Number.isFinite(refinedOffset)
        ? refinedOffset
        : firstPassOffset,
    };
  } catch {
    return { timeZoneId: null, timezoneValue: null };
  }
}

export function enrichBirthDataWithTimezone<T extends BirthTimezoneContext>(
  input: T
): T {
  if (
    input.timeZoneId &&
    input.timezoneValue !== null &&
    input.timezoneValue !== undefined
  ) {
    return input;
  }

  return {
    ...input,
    ...resolveBirthTimezoneContext(input),
  };
}

export function buildNatalChartPayload(input: {
  date: string;
  timeSlot: string;
  lat: number | string | null;
  lon: number | string | null;
  timezoneValue?: number | null;
  timeZoneId?: string | null;
}) {
  const parsedDate = parseIsoDate(input.date);
  const latitude = toFiniteNumber(input.lat);
  const longitude = toFiniteNumber(input.lon);
  const enrichedInput = enrichBirthDataWithTimezone(input);

  if (!parsedDate) {
    throw new Error('Birth date is required to calculate a chart.');
  }

  if (latitude === null || longitude === null) {
    throw new Error('Birth coordinates are required to calculate a chart.');
  }

  return {
    year: parsedDate.year,
    month: parsedDate.month,
    day: parsedDate.day,
    timeSlot: input.timeSlot || 'unknown',
    timezone: enrichedInput.timezoneValue ?? 0,
    latitude,
    longitude,
  };
}