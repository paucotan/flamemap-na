export type TimezoneMode = 'auto' | 'UTC' | 'America/Vancouver' | 'America/Denver' | 'America/Chicago' | 'America/New_York';

export function getDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

export function formatTimestampWithTimezone(
  dateInput: string | Date,
  mode: TimezoneMode = 'auto',
  locale: string = 'en-US'
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const tz = mode === 'auto' ? getDetectedTimezone() : mode;

  try {
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: tz
    }).format(date);

    return formatted;
  } catch (e) {
    return date.toUTCString();
  }
}

export function getTimezoneBadgeLabel(mode: TimezoneMode = 'auto'): string {
  const tz = mode === 'auto' ? getDetectedTimezone() : mode;
  if (tz.includes('Vancouver') || tz.includes('Los_Angeles')) return 'PT';
  if (tz.includes('Denver') || tz.includes('Edmonton')) return 'MT';
  if (tz.includes('Chicago') || tz.includes('Winnipeg')) return 'CT';
  if (tz.includes('New_York') || tz.includes('Toronto')) return 'ET';
  if (tz === 'UTC') return 'UTC';
  return tz.split('/')[1] || tz;
}
