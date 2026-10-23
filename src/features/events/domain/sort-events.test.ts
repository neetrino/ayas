import { describe, expect, it } from 'vitest';

import { findEventBySlug, sortEvents } from '@/features/events/domain/sort-events';

describe('sortEvents', () => {
  it('orders events by date, then start time', () => {
    const sorted = sortEvents([
      { slug: 'later', date: '2026-12-18', startTime: '19:30' },
      { slug: 'early-late', date: '2026-08-12', startTime: '21:00' },
      { slug: 'early', date: '2026-08-12', startTime: '19:00' },
    ]);

    expect(sorted.map((event) => event.slug)).toEqual(['early', 'early-late', 'later']);
  });
});

describe('findEventBySlug', () => {
  it('returns the matching event', () => {
    const events = [{ slug: 'spring-gala', name: 'Spring gala' }];

    expect(findEventBySlug(events, 'spring-gala')?.name).toBe('Spring gala');
    expect(findEventBySlug(events, 'missing')).toBeUndefined();
  });
});
