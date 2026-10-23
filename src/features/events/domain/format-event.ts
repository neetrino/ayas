const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Locale date for a calendar day stored as YYYY-MM-DD. */
export function formatEventDate(isoDate: string, locale: string): string {
  const match = DATE_PATTERN.exec(isoDate);
  const year = match?.[1];
  const month = match?.[2];
  const day = match?.[3];

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
}

/** Locale clock time for a HH:mm start time. */
export function formatEventTime(startTime: string, locale: string): string {
  const match = TIME_PATTERN.exec(startTime);
  const hours = match?.[1];
  const minutes = match?.[2];

  if (hours === undefined || minutes === undefined) {
    return startTime;
  }

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 0, 1, Number(hours), Number(minutes))));
}

/** Hours and minutes for a positive whole-minute duration. */
export function formatEventDuration(totalMinutes: number, locale: string): string {
  if (!Number.isInteger(totalMinutes) || totalMinutes <= 0) {
    return String(totalMinutes);
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourText = formatUnit(locale, 'hour', hours);
  const minuteText = formatUnit(locale, 'minute', minutes);

  if (hours === 0) {
    return minuteText;
  }

  if (minutes === 0) {
    return hourText;
  }

  return `${hourText} ${minuteText}`;
}

function formatUnit(locale: string, unit: 'hour' | 'minute', value: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'long',
  }).format(value);
}
