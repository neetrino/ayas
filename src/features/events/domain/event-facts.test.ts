import { describe, expect, it } from 'vitest';

import { eventFactRows, visibleAgeRestriction } from '@/features/events/domain/event-facts';

const labels = {
  date: 'Date',
  startTime: 'Start time',
  duration: 'Duration',
  venue: 'Venue',
  address: 'Address',
  age: 'Age restriction',
  price: 'Ticket price',
};

describe('visibleAgeRestriction', () => {
  it('drops a missing or blank restriction', () => {
    expect(visibleAgeRestriction(null)).toBeNull();
    expect(visibleAgeRestriction('   ')).toBeNull();
    expect(visibleAgeRestriction('12+')).toBe('12+');
  });
});

describe('eventFactRows', () => {
  it('omits age when the event has no restriction', () => {
    const ids = eventFactRows({
      labels,
      date: 'August 12, 2026',
      startTime: '19:00',
      duration: '1 hour 30 minutes',
      venue: 'AYAS stage',
      address: '15 Abovyan Street, Yerevan',
      ageRestriction: null,
      price: '8 000 AMD',
    }).map((row) => row.id);

    expect(ids).toEqual(['date', 'startTime', 'duration', 'venue', 'address', 'price']);
  });

  it('places age before the ticket price', () => {
    const ids = eventFactRows({
      labels,
      date: 'December 18, 2026',
      startTime: '19:30',
      duration: '2 hours',
      venue: 'AYAS stage',
      address: '15 Abovyan Street, Yerevan',
      ageRestriction: '12+',
      price: '10 000 AMD',
    }).map((row) => row.id);

    expect(ids).toEqual([
      'date',
      'startTime',
      'duration',
      'venue',
      'address',
      'age',
      'price',
    ]);
  });
});
