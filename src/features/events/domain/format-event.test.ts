import { describe, expect, it } from 'vitest';

import {
  formatEventDate,
  formatEventDuration,
  formatEventTime,
} from '@/features/events/domain/format-event';

describe('formatEventDate', () => {
  it('formats a calendar day in the locale', () => {
    expect(formatEventDate('2026-08-12', 'en')).toBe('August 12, 2026');
  });

  it('keeps an unreadable date as written', () => {
    expect(formatEventDate('12/08/2026', 'en')).toBe('12/08/2026');
  });
});

describe('formatEventTime', () => {
  it('formats a 24-hour start time', () => {
    expect(formatEventTime('19:00', 'en')).toBe('19:00');
  });
});

describe('formatEventDuration', () => {
  it('splits hours and leftover minutes', () => {
    expect(formatEventDuration(90, 'en')).toBe('1 hour 30 minutes');
    expect(formatEventDuration(120, 'en')).toBe('2 hours');
    expect(formatEventDuration(45, 'en')).toBe('45 minutes');
  });
});
