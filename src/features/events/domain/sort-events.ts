type TimedEvent = {
  date: string;
  startTime: string;
};

/** Soonest date and start time first. ISO dates sort lexicographically. */
export function sortEvents<T extends TimedEvent>(events: readonly T[]): T[] {
  return [...events].sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);
    return byDate === 0 ? left.startTime.localeCompare(right.startTime) : byDate;
  });
}

export function findEventBySlug<T extends { slug: string }>(
  events: readonly T[],
  slug: string,
): T | undefined {
  return events.find((event) => event.slug === slug);
}
