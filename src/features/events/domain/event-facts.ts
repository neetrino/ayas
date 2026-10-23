export type EventFact = {
  id: string;
  label: string;
  value: string;
};

type EventFactLabels = {
  date: string;
  startTime: string;
  duration: string;
  venue: string;
  address: string;
  age: string;
  price: string;
};

type EventFactInput = {
  labels: EventFactLabels;
  date: string;
  startTime: string;
  duration: string;
  venue: string;
  address: string;
  ageRestriction: string | null;
  price: string;
};

/** Age is omitted when the event has no restriction. */
export function visibleAgeRestriction(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** Detail rows in the order a visitor reads the event. */
export function eventFactRows(input: EventFactInput): EventFact[] {
  const age = visibleAgeRestriction(input.ageRestriction);
  const rows: EventFact[] = [
    { id: 'date', label: input.labels.date, value: input.date },
    { id: 'startTime', label: input.labels.startTime, value: input.startTime },
    { id: 'duration', label: input.labels.duration, value: input.duration },
    { id: 'venue', label: input.labels.venue, value: input.venue },
    { id: 'address', label: input.labels.address, value: input.address },
  ];

  if (age !== null) {
    rows.push({ id: 'age', label: input.labels.age, value: age });
  }

  rows.push({ id: 'price', label: input.labels.price, value: input.price });
  return rows;
}
